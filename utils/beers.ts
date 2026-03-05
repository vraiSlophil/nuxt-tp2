export type BeerType = 'ale' | 'stouts'

export interface Beer {
  id: number
  name: string
  price?: string | null
  image?: string | null
  rating?: {
    average?: number
    reviews?: number
  } | null
  [key: string]: unknown
}

export interface BeerPaginationResult {
  items: Beer[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

const PRICE_PATTERN = /[0-9]+(?:[.,][0-9]+)?/
const API_BASE_URL = 'https://api.sampleapis.com/beers'

export const DEFAULT_PER_PAGE = 12

export const normalizeBeerType = (value: unknown): BeerType => {
  return value === 'stouts' ? 'stouts' : 'ale'
}

export const toBeerEndpoint = (type: BeerType): string => {
  return `${API_BASE_URL}/${type}`
}

export const parsePositiveInt = (value: unknown, fallback: number): number => {
  const firstValue = Array.isArray(value) ? value[0] : value
  const parsed = Number.parseInt(String(firstValue ?? ''), 10)

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback
  }

  return parsed
}

export const parsePriceMax = (value: unknown): number | null => {
  const firstValue = Array.isArray(value) ? value[0] : value

  if (firstValue === undefined || firstValue === null || firstValue === '') {
    return null
  }

  const parsed = Number.parseFloat(String(firstValue).replace(',', '.'))

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

export const parseBeerPrice = (value: unknown): number | null => {
  if (typeof value !== 'string') {
    return null
  }

  const match = value.match(PRICE_PATTERN)

  if (!match) {
    return null
  }

  const parsed = Number.parseFloat(match[0].replace(',', '.'))

  if (!Number.isFinite(parsed)) {
    return null
  }

  return parsed
}

export const filterBeersByPrice = (beers: Beer[], priceMax: number | null): Beer[] => {
  if (priceMax === null) {
    return beers
  }

  return beers.filter((beer) => {
    const parsedPrice = parseBeerPrice(beer.price)

    if (parsedPrice === null) {
      return false
    }

    return parsedPrice <= priceMax
  })
}

export const paginateBeers = (
  beers: Beer[],
  page: number,
  perPage: number
): BeerPaginationResult => {
  const safePerPage = perPage > 0 ? perPage : DEFAULT_PER_PAGE
  const total = beers.length
  const totalPages = Math.max(1, Math.ceil(total / safePerPage))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * safePerPage
  const end = start + safePerPage

  return {
    items: beers.slice(start, end),
    total,
    page: safePage,
    perPage: safePerPage,
    totalPages
  }
}

export const toBeerId = (value: unknown): number | null => {
  const parsed = Number.parseInt(String(value ?? ''), 10)

  if (!Number.isFinite(parsed) || parsed < 1) {
    return null
  }

  return parsed
}

export const getBeerImage = (beer: Beer): string | null => {
  if (typeof beer.image === 'string' && beer.image.length > 0) {
    return beer.image
  }

  return null
}

export const formatBeerPrice = (value: unknown): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'Prix inconnu'
  }

  return value
}
