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
import { getMysqlPool } from '#server/utils/mysql'
import { fetchRemoteBeerById, fetchRemoteBeersByType } from '#server/utils/remote-beers'
import { requireSessionUser } from '#server/utils/session'

interface FavoriteBeerRow extends RowDataPacket {
  beerId: number
  beerType: BeerType
  favoritedAt: string
}

const isBeerType = (value: unknown): value is BeerType => {
  return value === 'ale' || value === 'stouts'
}

const fetchFavoriteBeerRecord = async (
  event: H3Event,
  payload: FavoriteBeerPayload,
  userId: string
): Promise<FavoriteBeerRecord | null> => {
  const [rows] = await getMysqlPool(event).execute<FavoriteBeerRow[]>(
    `
      SELECT
        beer_id AS beerId,
        beer_type AS beerType,
        DATE_FORMAT(favorited_at, '%Y-%m-%dT%H:%i:%sZ') AS favoritedAt
      FROM favorite_beers
      WHERE user_id = ? AND beer_id = ? AND beer_type = ?
      LIMIT 1
    `,
    [userId, payload.beerId, payload.beerType]
  )

  return rows[0] ?? null
}

const toFavoriteBeer = (favorite: FavoriteBeerRecord, beer: Beer | null): FavoriteBeer => {
  const fallbackBeer: Beer = {
    id: favorite.beerId,
    image: null,
    name: `Bière #${favorite.beerId}`,
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
      statusMessage: 'Corps de requête invalide'
    })
  }

  const payload = body as Record<string, unknown>
  const beerId = toBeerId(payload.beerId ?? payload.id)
  const beerType = payload.beerType ?? payload.type

  if (beerId === null) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de bière invalide'
    })
  }

  if (!isBeerType(beerType)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Type de bière invalide'
    })
  }

  return {
    beerId,
    beerType
  }
}

export const listFavoriteBeers = async (event: H3Event): Promise<FavoriteBeer[]> => {
  const { id: userId } = requireSessionUser(event)
  const [favoriteRows] = await getMysqlPool(event).execute<FavoriteBeerRow[]>(
    `
      SELECT
        beer_id AS beerId,
        beer_type AS beerType,
        DATE_FORMAT(favorited_at, '%Y-%m-%dT%H:%i:%sZ') AS favoritedAt
      FROM favorite_beers
      WHERE user_id = ?
      ORDER BY favorited_at DESC, beer_type ASC, beer_id ASC
    `,
    [userId]
  )

  return toFavoriteBeers(favoriteRows)
}

export const saveFavoriteBeer = async (
  event: H3Event,
  payload: FavoriteBeerPayload
): Promise<FavoriteBeer> => {
  const { id: userId } = requireSessionUser(event)
  const remoteBeer = await fetchRemoteBeerById(payload.beerType, payload.beerId)

  if (!remoteBeer) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Bière introuvable'
    })
  }

  await getMysqlPool(event).execute<ResultSetHeader>(
    `
      INSERT INTO favorite_beers (user_id, beer_id, beer_type, favorited_at)
      VALUES (?, ?, ?, UTC_TIMESTAMP())
      ON DUPLICATE KEY UPDATE favorited_at = VALUES(favorited_at)
    `,
    [userId, payload.beerId, payload.beerType]
  )

  const favoriteRecord = await fetchFavoriteBeerRecord(event, payload, userId)

  if (!favoriteRecord) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de retrouver le favori après insertion'
    })
  }

  return toFavoriteBeer(favoriteRecord, remoteBeer)
}

export const removeFavoriteBeer = async (
  event: H3Event,
  payload: FavoriteBeerPayload
): Promise<boolean> => {
  const { id: userId } = requireSessionUser(event)
  const [result] = await getMysqlPool(event).execute<ResultSetHeader>(
    `
      DELETE FROM favorite_beers
      WHERE user_id = ? AND beer_id = ? AND beer_type = ?
      LIMIT 1
    `,
    [userId, payload.beerId, payload.beerType]
  )

  return result.affectedRows > 0
}
