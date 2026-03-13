<script setup lang="ts">
import type { Beer, BeerType } from '~~/utils/beers'
import { formatBeerPrice, getBeerImage } from '~~/utils/beers'

interface BeerGridProps {
  beers: Beer[]
  type: BeerType
  detailsBasePath: string
  loading?: boolean
  emptyMessage?: string
}

const props = withDefaults(defineProps<BeerGridProps>(), {
  loading: false,
  emptyMessage: 'Aucune biere a afficher.'
})

const favoritesStore = useFavoritesStore()
const { ensureLoaded, isFavorite, toggleFavorite } = favoritesStore

const detailsTo = (beerId: number): string => {
  return `${props.detailsBasePath}/${beerId}?type=${props.type}`
}

const isBeerFavorite = (beerId: number): boolean => {
  return isFavorite(beerId, props.type)
}

const toggleBeerFavorite = async (beer: Beer): Promise<void> => {
  await toggleFavorite(beer, props.type)
}

const averageRating = (beer: Beer): number | null => {
  const value = beer.rating?.average

  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null
  }

  return Math.max(0, Math.min(5, value))
}

const formatRating = (beer: Beer): string | null => {
  const value = averageRating(beer)

  if (value === null) {
    return null
  }

  return value.toFixed(2)
}

onMounted(async () => {
  await ensureLoaded()
})
</script>

<template>
  <section class="space-y-4">
    <div v-if="loading" class="rounded-box border-2 border-base-300 bg-base-100 px-4 py-6 text-sm">
      Chargement...
    </div>

    <div v-else-if="beers.length === 0" class="alert">
      <span>{{ emptyMessage }}</span>
    </div>

    <ul v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Liste des bieres">
      <li v-for="beer in beers" :key="`${type}-${beer.id}`"
        class="card overflow-hidden border-2 border-base-300 bg-base-100">
        <figure class="relative h-52 w-full bg-base-200">
          <img v-if="getBeerImage(beer)" :src="getBeerImage(beer) ?? undefined" :alt="`Photo de ${beer.name}`"
            class="h-full w-full p-4 object-contain" loading="lazy">
          <div v-else class="flex h-full w-full items-center justify-center text-sm">Image non disponible</div>

          <span class="badge badge-secondary absolute bottom-2 left-2">{{ type }}</span>

          <button type="button"
            class="btn btn-circle btn-sm absolute right-2 top-2 flex justify-center align-center border-black/50 text-black/50 hover:text-black"
            :class="{
              'text-red-500': isBeerFavorite(beer.id)
            }" :aria-label="isBeerFavorite(beer.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
            @click="toggleBeerFavorite(beer)">
            <span class="material-symbols-rounded text-[18px] pt-1">
              favorite
            </span>
          </button>
        </figure>

        <div class="card-body p-4">
          <h3 class="card-title text-base">{{ beer.name }}</h3>

          <div class="flex flex-wrap gap-2 text-sm">
            <span class="badge badge-outline">ID: {{ beer.id }}</span>
            <span class="badge badge-outline">{{ formatBeerPrice(beer.price) }}</span>
            <span v-if="formatRating(beer) !== null" class="badge badge-accent">Note: {{ formatRating(beer) }}/5</span>
          </div>

          <NuxtLink :to="detailsTo(beer.id)" class="btn btn-outline btn-sm mt-2 w-full gap-1">
            <span class="material-symbols-rounded text-[18px] ">open_in_new</span>
            Voir details
          </NuxtLink>
        </div>
      </li>
    </ul>
  </section>
</template>
