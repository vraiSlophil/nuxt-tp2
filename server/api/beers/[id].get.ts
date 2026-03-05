import { createError, getQuery, getRouterParam } from 'h3'
import type { Beer, BeerType } from '~~/utils/beers'
import { normalizeBeerType, toBeerEndpoint, toBeerId } from '~~/utils/beers'

const fetchBeerById = async (id: number, type: BeerType): Promise<Beer | null> => {
  const beers = await $fetch<Beer[]>(toBeerEndpoint(type))

  if (!Array.isArray(beers)) {
    return null
  }

  return beers.find((beer) => {
    return beer.id === id
  }) ?? null
}

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, 'id')
  const beerId = toBeerId(idParam)

  if (beerId === null) {
    throw createError({ statusCode: 400, statusMessage: 'ID de biere invalide' })
  }

  const query = getQuery(event)
  const type = normalizeBeerType(query.type)

  let beer: Beer | null = null

  try {
    beer = await fetchBeerById(beerId, type)
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Impossible de recuperer la biere distante',
      data: error
    })
  }

  if (!beer) {
    throw createError({ statusCode: 404, statusMessage: 'Biere introuvable' })
  }

  return {
    ...beer,
    type
  }
})
