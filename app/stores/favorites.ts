import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FavoriteBeer, FavoriteBeerPayload } from '~~/utils/favorites'
import type { Beer, BeerType } from '~~/utils/beers'

const toFavoriteKey = (id: number, type: BeerType): string => {
  return `${type}-${id}`
}

const toFavoritePayload = (id: number, type: BeerType): FavoriteBeerPayload => {
  return {
    beerId: id,
    beerType: type
  }
}

export const useFavoritesStore = defineStore('favorites', () => {
  const toast = useToast()
  const favorites = ref<FavoriteBeer[]>([])
  const loaded = ref(false)
  const pending = ref(false)
  const errorMessage = ref('')

  const reportError = (message: string): void => {
    errorMessage.value = message

    if (import.meta.client) {
      toast.error(message, { title: 'Favoris' })
    }
  }

  const fetchFavorites = async (options: { force?: boolean } = {}): Promise<FavoriteBeer[]> => {
    if (pending.value) {
      return favorites.value
    }

    if (loaded.value && !options.force) {
      return favorites.value
    }

    pending.value = true
    errorMessage.value = ''

    try {
      const response = await $fetch<FavoriteBeer[]>('/api/favorites')

      favorites.value = Array.isArray(response) ? response : []
      loaded.value = true

      return favorites.value
    } catch {
      reportError('Impossible de charger les favoris.')

      if (!loaded.value) {
        favorites.value = []
      }

      return favorites.value
    } finally {
      pending.value = false
    }
  }

  const ensureLoaded = async (): Promise<FavoriteBeer[]> => {
    return fetchFavorites()
  }

  const refreshFavorites = async (): Promise<FavoriteBeer[]> => {
    return fetchFavorites({ force: true })
  }

  const isFavorite = (id: number, type: BeerType): boolean => {
    return favorites.value.some((favorite) => {
      return toFavoriteKey(favorite.id, favorite.favoriteType) === toFavoriteKey(id, type)
    })
  }

  const setFavorite = (favorite: FavoriteBeer): void => {
    const favoriteKey = toFavoriteKey(favorite.id, favorite.favoriteType)

    favorites.value = [
      favorite,
      ...favorites.value.filter((item) => {
        return toFavoriteKey(item.id, item.favoriteType) !== favoriteKey
      })
    ]
  }

  const removeFavoriteFromState = (id: number, type: BeerType): void => {
    favorites.value = favorites.value.filter((favorite) => {
      return toFavoriteKey(favorite.id, favorite.favoriteType) !== toFavoriteKey(id, type)
    })
  }

  const toggleFavorite = async (beer: Beer, type: BeerType): Promise<void> => {
    errorMessage.value = ''

    if (isFavorite(beer.id, type)) {
      await removeFavorite(beer.id, type)
      return
    }

    try {
      const response = await $fetch<{ favorite: FavoriteBeer }>('/api/favorites', {
        body: toFavoritePayload(beer.id, type),
        method: 'POST'
      })

      if (!response.favorite) {
        throw new Error('Missing favorite payload')
      }

      setFavorite(response.favorite)
      loaded.value = true
    } catch {
      reportError('Impossible de mettre a jour les favoris.')
    }
  }

  const removeFavorite = async (id: number, type: BeerType): Promise<void> => {
    errorMessage.value = ''

    try {
      await $fetch('/api/favorites', {
        body: toFavoritePayload(id, type),
        method: 'DELETE'
      })

      removeFavoriteFromState(id, type)
    } catch {
      reportError('Impossible de mettre a jour les favoris.')
    }
  }

  return {
    errorMessage,
    favorites,
    loaded,
    pending,
    ensureLoaded,
    refreshFavorites,
    isFavorite,
    toggleFavorite,
    removeFavorite
  }
})
