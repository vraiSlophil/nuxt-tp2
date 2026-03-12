<script setup lang="ts">
import type { FavoriteBeer } from '~/composables/useBeerFavorites'
import { formatBeerPrice, getBeerImage } from '~~/utils/beers'

const { favorites, ensureLoaded, removeFavorite } = useBeerFavorites()

const getDetailsPath = (favorite: FavoriteBeer): string => {
  return `/bieres-client/${favorite.id}?type=${favorite.favoriteType}`
}

const remove = (favorite: FavoriteBeer): void => {
  removeFavorite(favorite.id, favorite.favoriteType)
}

onMounted(() => {
  ensureLoaded()
})
</script>

<template>
  <section class="space-y-4">
    <div class="breadcrumbs text-sm">
      <ul>
        <li>
          <NuxtLink to="/">Accueil</NuxtLink>
        </li>
        <li>Favoris</li>
      </ul>
    </div>

    <div v-if="favorites.length === 0" class="alert">
      <span>Aucune biere en favori pour le moment.</span>
    </div>

    <ul v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Liste des favoris">
      <li v-for="favorite in favorites" :key="`${favorite.favoriteType}-${favorite.id}`"
        class="card overflow-hidden border-2 border-base-300 bg-base-100">
        <figure class="relative h-52 w-full bg-base-200">
          <img v-if="getBeerImage(favorite)" :src="getBeerImage(favorite) ?? undefined"
            :alt="`Photo de ${favorite.name}`" class="h-full w-full object-contain" loading="lazy">
          <div v-else class="alert max-w-full text-sm">Image non disponible</div>

          <span class="badge badge-secondary absolute bottom-2 left-2">{{ favorite.favoriteType }}</span>
        </figure>

        <div class="card-body p-4">
          <h2 class="card-title text-base">{{ favorite.name }}</h2>

          <div class="flex flex-wrap gap-2 text-sm">
            <span class="badge badge-outline">{{ formatBeerPrice(favorite.price) }}</span>
          </div>

          <div class="join w-full">
            <NuxtLink :to="getDetailsPath(favorite)" class="btn join-item btn-outline btn-sm flex-1">
              Voir details
            </NuxtLink>
            <button type="button" class="btn join-item btn-error btn-sm flex-1" @click="remove(favorite)">
              Retirer
            </button>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>
