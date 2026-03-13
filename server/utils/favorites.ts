import { createError } from 'h3'
import type { H3Event } from 'h3'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import type { Beer, BeerType } from '~~/utils/beers'
import type {
  FavoriteBeer,
  FavoriteBeerPayload,
  FavoriteBeerRecord
} from '~~/utils/favorites'
import { toBeerId } from '~~/utils/beers'
import { getMysqlPool, getMysqlPoolSignature } from '#server/utils/mysql'
import { fetchRemoteBeerById, fetchRemoteBeersByType } from '#server/utils/remote-beers'

interface FavoriteBeerRow extends RowDataPacket {
  beerId: number
  beerType: BeerType
  favoritedAt: string
}

const CREATE_FAVORITES_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS favorite_beers (
    beer_id INT UNSIGNED NOT NULL,
    beer_type ENUM('ale', 'stouts') NOT NULL,
    favorited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (beer_id, beer_type),
    INDEX idx_favorite_beers_favorited_at (favorited_at DESC)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`

let tableReadyPromise: Promise<void> | null = null
let tableReadyKey = ''

const isBeerType = (value: unknown): value is BeerType => {
  return value === 'ale' || value === 'stouts'
}

const withTable = async <T>(event: H3Event, callback: () => Promise<T>): Promise<T> => {
  await ensureFavoriteBeersTable(event)

  return callback()
}

const ensureFavoriteBeersTable = async (event: H3Event): Promise<void> => {
  const nextTableReadyKey = getMysqlPoolSignature(event)

  if (!tableReadyPromise || tableReadyKey !== nextTableReadyKey) {
    tableReadyKey = nextTableReadyKey
    tableReadyPromise = getMysqlPool(event)
      .execute(CREATE_FAVORITES_TABLE_QUERY)
      .then(() => undefined)
      .catch((error) => {
        tableReadyPromise = null
        throw error
      })
  }

  await tableReadyPromise
}

const fetchFavoriteBeerRecord = async (
  event: H3Event,
  payload: FavoriteBeerPayload
): Promise<FavoriteBeerRecord | null> => {
  return withTable(event, async () => {
    const [rows] = await getMysqlPool(event).execute<FavoriteBeerRow[]>(
      `
        SELECT
          beer_id AS beerId,
          beer_type AS beerType,
          DATE_FORMAT(favorited_at, '%Y-%m-%dT%H:%i:%sZ') AS favoritedAt
        FROM favorite_beers
        WHERE beer_id = ? AND beer_type = ?
        LIMIT 1
      `,
      [payload.beerId, payload.beerType]
    )

    return rows[0] ?? null
  })
}

const toFavoriteBeer = (favorite: FavoriteBeerRecord, beer: Beer | null): FavoriteBeer => {
  const fallbackBeer: Beer = {
    id: favorite.beerId,
    image: null,
    name: `Biere #${favorite.beerId}`,
    price: null,
    rating: null
  }

  return {
    ...(beer ?? fallbackBeer),
    favoriteType: favorite.beerType,
    favoritedAt: favorite.favoritedAt
  }
}

const toFavoriteBeers = async (rows: FavoriteBeerRecord[]): Promise<FavoriteBeer[]> => {
  const beerTypes = [...new Set(rows.map(row => row.beerType))]
  const beersByTypeEntries = await Promise.all(
    beerTypes.map(async (beerType) => {
      return [beerType, await fetchRemoteBeersByType(beerType)] as const
    })
  )
  const beersByType = new Map<BeerType, Beer[]>(beersByTypeEntries)

  return rows.map((row) => {
    const beer = beersByType.get(row.beerType)?.find((item) => {
      return item.id === row.beerId
    }) ?? null

    return toFavoriteBeer(row, beer)
  })
}

export const parseFavoriteBeerPayload = (body: unknown): FavoriteBeerPayload => {
  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Corps de requete invalide'
    })
  }

  const payload = body as Record<string, unknown>
  const beerId = toBeerId(payload.beerId ?? payload.id)
  const beerType = payload.beerType ?? payload.type

  if (beerId === null) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de biere invalide'
    })
  }

  if (!isBeerType(beerType)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Type de biere invalide'
    })
  }

  return {
    beerId,
    beerType
  }
}

export const listFavoriteBeers = async (event: H3Event): Promise<FavoriteBeer[]> => {
  const favoriteRows = await withTable(event, async () => {
    const [rows] = await getMysqlPool(event).execute<FavoriteBeerRow[]>(
      `
        SELECT
          beer_id AS beerId,
          beer_type AS beerType,
          DATE_FORMAT(favorited_at, '%Y-%m-%dT%H:%i:%sZ') AS favoritedAt
        FROM favorite_beers
        ORDER BY favorited_at DESC, beer_type ASC, beer_id ASC
      `
    )

    return rows
  })

  return toFavoriteBeers(favoriteRows)
}

export const saveFavoriteBeer = async (
  event: H3Event,
  payload: FavoriteBeerPayload
): Promise<FavoriteBeer> => {
  const remoteBeer = await fetchRemoteBeerById(payload.beerType, payload.beerId)

  if (!remoteBeer) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Biere introuvable'
    })
  }

  await withTable(event, async () => {
    await getMysqlPool(event).execute<ResultSetHeader>(
      `
        INSERT INTO favorite_beers (beer_id, beer_type, favorited_at)
        VALUES (?, ?, UTC_TIMESTAMP())
        ON DUPLICATE KEY UPDATE favorited_at = VALUES(favorited_at)
      `,
      [payload.beerId, payload.beerType]
    )
  })

  const favoriteRecord = await fetchFavoriteBeerRecord(event, payload)

  if (!favoriteRecord) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de retrouver le favori apres insertion'
    })
  }

  return toFavoriteBeer(favoriteRecord, remoteBeer)
}

export const removeFavoriteBeer = async (
  event: H3Event,
  payload: FavoriteBeerPayload
): Promise<boolean> => {
  return withTable(event, async () => {
    const [result] = await getMysqlPool(event).execute<ResultSetHeader>(
      `
        DELETE FROM favorite_beers
        WHERE beer_id = ? AND beer_type = ?
        LIMIT 1
      `,
      [payload.beerId, payload.beerType]
    )

    return result.affectedRows > 0
  })
}
