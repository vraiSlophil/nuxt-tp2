<script setup lang="ts">
import type { Beer, BeerType } from '~~/utils/beers'
import { formatBeerPrice, getBeerImage, normalizeBeerType } from '~~/utils/beers'

const route = useRoute()

const { ensureLoaded, isFavorite, toggleFavorite } = useBeerFavorites()

const beerType = computed<BeerType>(() => {
  return normalizeBeerType(route.query.type)
})

const endpoint = computed(() => {
  return `/api/beers/${route.params.id}`
})

const beerQuery = computed<Record<string, string>>(() => {
  return { type: beerType.value }
})

const { data: beer, pending, error } = await useFetch<Beer>(endpoint, {
  query: beerQuery
})

onMounted(() => {
  ensureLoaded()
})

const isCurrentFavorite = computed(() => {
  if (!beer.value || typeof beer.value.id !== 'number') {
    return false
  }

  return isFavorite(beer.value.id, beerType.value)
})

const toggleCurrentFavorite = (): void => {
  if (!beer.value) {
    return
  }

  toggleFavorite(beer.value, beerType.value)
}

const formatRating = (value: unknown): string | null => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null
  }

  return Math.max(0, Math.min(5, value)).toFixed(2)
}
</script>

<template>
  <section class="space-y-4">
    <div class="breadcrumbs text-sm">
      <ul>
        <li>
          <NuxtLink to="/">Accueil</NuxtLink>
        </li>
        <li>
          <NuxtLink :to="`/bieres-serveur?type=${beerType}`">Bieres serveur</NuxtLink>
        </li>
        <li>#{{ route.params.id }}</li>
      </ul>
    </div>

    <div class="card border border-base-300 bg-base-100">
      <div class="card-body space-y-3">
        <h1 class="card-title text-2xl">/bieres-serveur/{{ route.params.id }}</h1>
      </div>
    </div>

    <div v-if="pending" class="flex items-center gap-2">
      <span class="loading loading-spinner loading-sm" />
      <span>Chargement...</span>
    </div>

    <div v-else-if="error" class="alert alert-error">
      <span>Biere introuvable ou erreur serveur.</span>
    </div>

    <article v-else-if="beer" class="card overflow-hidden rounded-2xl border-2 border-base-300 bg-base-100">
      <figure class="relative h-72 w-full bg-base-200">
        <img v-if="getBeerImage(beer)" :src="getBeerImage(beer) ?? undefined" :alt="`Photo de ${beer.name}`"
          class="h-full w-full object-contain">

        <button type="button"
          class="btn btn-circle btn-sm absolute right-2 top-2 border-2 border-black bg-white text-black hover:bg-white"
          :class="{ 'bg-red-500 text-white hover:bg-red-500': isCurrentFavorite }"
          :aria-label="isCurrentFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
          @click="toggleCurrentFavorite">
          <span class="material-symbols-rounded text-[18px] leading-none">
            {{ isCurrentFavorite ? 'favorite' : 'favorite_border' }}
          </span>
        </button>
      </figure>

      <div class="card-body space-y-3">
        <h2 class="card-title">{{ beer.name }}</h2>

        <div class="flex flex-wrap gap-2 text-sm">
          <span class="badge badge-outline">ID: {{ beer.id }}</span>
          <span class="badge badge-outline">{{ formatBeerPrice(beer.price) }}</span>
          <span class="badge badge-secondary">{{ beerType }}</span>
          <span v-if="formatRating(beer.rating?.average)" class="badge badge-accent">
            Note: {{ formatRating(beer.rating?.average) }}/5
          </span>
        </div>

        <NuxtLink :to="`/bieres-serveur?type=${beerType}`" class="btn btn-outline gap-1">
          <span class="material-symbols-rounded text-[18px] leading-none">arrow_back</span>
          Retour a la liste serveur
        </NuxtLink>
      </div>
    </article>
  </section>
</template>
