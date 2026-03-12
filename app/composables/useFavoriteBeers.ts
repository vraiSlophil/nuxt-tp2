import type { Beer, BeerType } from '~~/utils/beers'

const FAVORITES_KEY = 'tp3-favorite-beers'

export interface FavoriteBeer extends Beer {
  favoriteType: BeerType
}

const isClient = (): boolean => {
  return import.meta.client
}

const toFavoriteKey = (id: number, type: BeerType): string => {
  return `${type}-${id}`
}

const isValidFavorite = (value: unknown): value is FavoriteBeer => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<FavoriteBeer>

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    (candidate.favoriteType === 'ale' || candidate.favoriteType === 'stouts')
  )
}

const readFavorites = (): FavoriteBeer[] => {
  if (!isClient()) {
    return []
  }

  const raw = localStorage.getItem(FAVORITES_KEY)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((item) => {
      return isValidFavorite(item)
    })
  } catch {
    return []
  }
}

const writeFavorites = (favorites: FavoriteBeer[]): void => {
  if (!isClient()) {
    return
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
}

export const useFavoriteBeers = () => {
  const favorites = useState<FavoriteBeer[]>('tp3-favorites', () => [])
  const loaded = useState<boolean>('tp3-favorites-loaded', () => false)

  const ensureLoaded = (): void => {
    if (!isClient() || loaded.value) {
      return
    }

    favorites.value = readFavorites()
    loaded.value = true
  }

  const isFavorite = (id: number, type: BeerType): boolean => {
    ensureLoaded()

    return favorites.value.some((favorite) => {
      return toFavoriteKey(favorite.id, favorite.favoriteType) === toFavoriteKey(id, type)
    })
  }

  const toggleFavorite = (beer: Beer, type: BeerType): void => {
    ensureLoaded()

    const favoriteKey = toFavoriteKey(beer.id, type)
    const index = favorites.value.findIndex((favorite) => {
      return toFavoriteKey(favorite.id, favorite.favoriteType) === favoriteKey
    })

    if (index >= 0) {
      favorites.value.splice(index, 1)
      writeFavorites(favorites.value)
      return
    }

    favorites.value.unshift({
      ...beer,
      favoriteType: type
    })

    writeFavorites(favorites.value)
  }

  const removeFavorite = (id: number, type: BeerType): void => {
    ensureLoaded()

    favorites.value = favorites.value.filter((favorite) => {
      return toFavoriteKey(favorite.id, favorite.favoriteType) !== toFavoriteKey(id, type)
    })

    writeFavorites(favorites.value)
  }

  return {
    favorites,
    loaded,
    ensureLoaded,
    isFavorite,
    toggleFavorite,
    removeFavorite
  }
}
