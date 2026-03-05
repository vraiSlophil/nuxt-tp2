import { createError, getQuery } from 'h3'
import type { Beer, BeerType } from '~~/utils/beers'
import {
  DEFAULT_PER_PAGE,
  filterBeersByPrice,
  normalizeBeerType,
  paginateBeers,
  parsePositiveInt,
  parsePriceMax,
  toBeerEndpoint
} from '~~/utils/beers'

const fetchBeersByType = async (type: BeerType): Promise<Beer[]> => {
  try {
    const beers = await $fetch<Beer[]>(toBeerEndpoint(type))

    if (!Array.isArray(beers)) {
      return []
    }

    return beers
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Impossible de recuperer les bieres distantes',
      data: error
    })
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = normalizeBeerType(query.type)
  const page = parsePositiveInt(query.page, 1)
  const perPage = parsePositiveInt(query.perPage, DEFAULT_PER_PAGE)
  const priceMax = parsePriceMax(query.pricemax)

  const beers = await fetchBeersByType(type)
  const filtered = filterBeersByPrice(beers, priceMax)
  const pagination = paginateBeers(filtered, page, perPage)

  return {
    ...pagination,
    type,
    priceMax
  }
})
