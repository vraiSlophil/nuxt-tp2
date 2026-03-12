import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { Beer, BeerPaginationResult, BeerType } from '~~/utils/beers'
import {
  DEFAULT_PER_PAGE,
  filterBeersByName,
  filterBeersByPrice,
  paginateBeers,
  parseSearchTerm,
  toBeerEndpoint
} from '~~/utils/beers'

interface BeerCollectionState {
  items: Beer[]
  pending: boolean
  error: string
  loaded: boolean
}

interface BeerQueryState {
  priceMax?: number | null
  search?: string
  page?: number
  perPage?: number
}

const createCollectionState = (): BeerCollectionState => ({
  items: [],
  pending: false,
  error: '',
  loaded: false
})

const createCollections = (): Record<BeerType, BeerCollectionState> => ({
  ale: createCollectionState(),
  stouts: createCollectionState()
})

export const useBeersStore = defineStore('beers', () => {
  const collections = reactive<Record<BeerType, BeerCollectionState>>(createCollections())

  const getCollection = (type: BeerType): BeerCollectionState => {
    return collections[type]
  }

  const getBeersByType = (type: BeerType): Beer[] => {
    return getCollection(type).items
  }

  const getPreviewBeers = (type: BeerType, limit = 6): Beer[] => {
    return getBeersByType(type).slice(0, Math.max(0, limit))
  }

  const getBeerById = (type: BeerType, id: number): Beer | null => {
    return getBeersByType(type).find((beer) => {
      return beer.id === id
    }) ?? null
  }

  const getPending = (type: BeerType): boolean => {
    return getCollection(type).pending
  }

  const getError = (type: BeerType): string => {
    return getCollection(type).error
  }

  const hasLoaded = (type: BeerType): boolean => {
    return getCollection(type).loaded
  }

  const getFilteredBeers = (type: BeerType, query: BeerQueryState = {}): Beer[] => {
    const beers = getBeersByType(type)
    const search = parseSearchTerm(query.search)
    const byName = filterBeersByName(beers, search)

    return filterBeersByPrice(byName, query.priceMax ?? null)
  }

  const getPagination = (type: BeerType, query: BeerQueryState = {}): BeerPaginationResult => {
    return paginateBeers(
      getFilteredBeers(type, query),
      query.page ?? 1,
      query.perPage ?? DEFAULT_PER_PAGE
    )
  }

  const fetchBeers = async (type: BeerType, options: { force?: boolean } = {}): Promise<Beer[]> => {
    const collection = getCollection(type)

    if (collection.pending) {
      return collection.items
    }

    if (collection.loaded && !options.force) {
      return collection.items
    }

    collection.pending = true
    collection.error = ''

    try {
      const response = await $fetch<Beer[]>(toBeerEndpoint(type))

      collection.items = Array.isArray(response) ? response : []
      collection.loaded = true

      return collection.items
    } catch {
      collection.error = 'Impossible de charger les bieres.'

      if (!collection.loaded) {
        collection.items = []
      }

      return collection.items
    } finally {
      collection.pending = false
    }
  }

  const ensureBeers = async (type: BeerType): Promise<Beer[]> => {
    return fetchBeers(type)
  }

  const refreshBeers = async (type: BeerType): Promise<Beer[]> => {
    return fetchBeers(type, { force: true })
  }

  return {
    collections,
    getBeersByType,
    getPreviewBeers,
    getBeerById,
    getPending,
    getError,
    hasLoaded,
    getFilteredBeers,
    getPagination,
    fetchBeers,
    ensureBeers,
    refreshBeers
  }
})
