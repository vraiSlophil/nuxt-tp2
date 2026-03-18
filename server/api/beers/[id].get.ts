import { createError, getQuery, getRouterParam } from 'h3'
import type { Beer, BeerType } from '~~/utils/beers'
import { normalizeBeerType, toBeerId } from '~~/utils/beers'
import { fetchRemoteBeerById } from '#server/utils/remote-beers'

const fetchBeerById = async (id: number, type: BeerType): Promise<Beer | null> => {
  return fetchRemoteBeerById(type, id)
}

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, 'id')
  const beerId = toBeerId(idParam)

  if (beerId === null) {
    throw createError({ statusCode: 400, statusMessage: 'ID de bière invalide' })
  }

  const query = getQuery(event)
  const type = normalizeBeerType(query.type)

  let beer: Beer | null = null

  try {
    beer = await fetchBeerById(beerId, type)
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Impossible de récupérer la bière distante',
      data: error
    })
  }

  if (!beer) {
    throw createError({ statusCode: 404, statusMessage: 'Bière introuvable' })
  }

  return {
    ...beer,
    type
  }
})
