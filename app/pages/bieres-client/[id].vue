<script setup lang="ts">
import type { Beer, BeerType } from '~~/utils/beers'
import {
  formatBeerPrice,
  getBeerImage,
  normalizeBeerType,
  toBeerEndpoint,
  toBeerId
} from '~~/utils/beers'

const route = useRoute()

const beer = ref<Beer | null>(null)
const pending = ref(false)
const errorMessage = ref('')

const { ensureLoaded, isFavorite, toggleFavorite } = useBeerFavorites()

const beerType = computed<BeerType>(() => {
  return normalizeBeerType(route.query.type)
})

const beerId = computed<number | null>(() => {
  return toBeerId(route.params.id)
})

const loadBeerClientSide = async (): Promise<void> => {
  if (beerId.value === null) {
    beer.value = null
    errorMessage.value = 'ID invalide.'
    return
  }

  pending.value = true
  errorMessage.value = ''

  try {
    const beers = await $fetch<Beer[]>(toBeerEndpoint(beerType.value))
    const found = Array.isArray(beers)
      ? beers.find((item) => {
        return item.id === beerId.value
      })
      : null

    beer.value = found ?? null

    if (!beer.value) {
      errorMessage.value = 'Biere introuvable.'
    }
  } catch {
    beer.value = null
    errorMessage.value = 'Erreur pendant le chargement client.'
  } finally {
    pending.value = false
  }
}

watch([beerType, beerId], async () => {
  if (import.meta.client) {
    await loadBeerClientSide()
  }
})

onMounted(() => {
  ensureLoaded()
  loadBeerClientSide()
})

const isCurrentFavorite = computed(() => {
  if (!beer.value) {
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
          <NuxtLink :to="`/bieres-client?type=${beerType}`">Bieres client</NuxtLink>
        </li>
        <li>#{{ route.params.id }}</li>
      </ul>
    </div>

    <div class="card border-2 border-base-300 bg-base-100">
      <div class="card-body space-y-3">
        <h1 class="card-title text-2xl">/bieres-client/{{ route.params.id }}</h1>
      </div>
    </div>

    <div v-if="pending" class="flex items-center gap-2">
      <span class="loading loading-spinner loading-sm" />
      <span>Chargement...</span>
    </div>

    <div v-else-if="errorMessage" class="alert alert-error">
      <span>{{ errorMessage }}</span>
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
          <span class="material-symbols-rounded text-[18px] ">
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

        <NuxtLink :to="`/bieres-client?type=${beerType}`" class="btn btn-outline gap-1">
          <span class="material-symbols-rounded text-[18px] ">arrow_back</span>
          Retour a la liste client
        </NuxtLink>
      </div>
    </article>
  </section>
</template>
