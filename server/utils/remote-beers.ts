import type { Beer, BeerType } from '~~/utils/beers'
import { toBeerEndpoint } from '~~/utils/beers'

const BEER_CACHE_TTL_MS = 5 * 60 * 1000

interface RemoteBeerCacheEntry {
  beers: Beer[]
  expiresAt: number
}

const remoteBeerCache = new Map<BeerType, RemoteBeerCacheEntry>()

export const fetchRemoteBeersByType = async (type: BeerType): Promise<Beer[]> => {
  const cachedEntry = remoteBeerCache.get(type)

  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return cachedEntry.beers
  }

  const beers = await $fetch<Beer[]>(toBeerEndpoint(type))
  const safeBeers = Array.isArray(beers) ? beers : []

  remoteBeerCache.set(type, {
    beers: safeBeers,
    expiresAt: Date.now() + BEER_CACHE_TTL_MS
  })

  return safeBeers
}

export const fetchRemoteBeerById = async (type: BeerType, id: number): Promise<Beer | null> => {
  const beers = await fetchRemoteBeersByType(type)

  return beers.find((beer) => {
    return beer.id === id
  }) ?? null
}
