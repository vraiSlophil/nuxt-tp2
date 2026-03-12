<script setup lang="ts">
import type { BeerType } from '~~/utils/beers'
import {
  DEFAULT_PER_PAGE,
  normalizeBeerType,
  parsePositiveInt,
  parsePriceMax
} from '~~/utils/beers'

interface BeerApiResponse {
  items: import('~~/utils/beers').Beer[]
  total: number
  page: number
  perPage: number
  totalPages: number
  type: BeerType
  priceMax: number | null
}

const route = useRoute()
const router = useRouter()

const perPage = DEFAULT_PER_PAGE
const priceInput = ref('')

const beerType = computed<BeerType>(() => {
  return normalizeBeerType(route.query.type)
})

const page = computed<number>(() => {
  return parsePositiveInt(route.query.page, 1)
})

const priceMax = computed<number | null>(() => {
  return parsePriceMax(route.query.pricemax)
})

watch(
  priceMax,
  (value) => {
    priceInput.value = value === null ? '' : String(value)
  },
  { immediate: true }
)

const serverQuery = computed<Record<string, string>>(() => {
  const query: Record<string, string> = {
    type: beerType.value,
    page: String(page.value),
    perPage: String(perPage)
  }

  if (priceMax.value !== null) {
    query.pricemax = String(priceMax.value)
  }

  return query
})

const { data, pending, error } = await useFetch<BeerApiResponse>('/api/beers', {
  query: serverQuery
})

const replaceQuery = async (patch: Record<string, string | undefined>): Promise<void> => {
  const nextQuery: Record<string, string> = {}

  Object.entries(route.query).forEach(([key, value]) => {
    const firstValue = Array.isArray(value) ? value[0] : value

    if (typeof firstValue === 'string') {
      nextQuery[key] = firstValue
    }
  })

  Object.entries(patch).forEach(([key, value]) => {
    if (!value) {
      delete nextQuery[key]
      return
    }

    nextQuery[key] = value
  })

  await router.replace({ query: nextQuery })
}

const applyFilters = async (): Promise<void> => {
  const parsedPrice = parsePriceMax(priceInput.value)

  await replaceQuery({
    type: beerType.value,
    pricemax: parsedPrice === null ? undefined : String(parsedPrice),
    page: '1'
  })
}

const resetFilters = async (): Promise<void> => {
  priceInput.value = ''

  await replaceQuery({
    type: beerType.value,
    pricemax: undefined,
    page: '1'
  })
}

const onTypeChange = async (event: Event): Promise<void> => {
  const target = event.target as HTMLSelectElement
  const nextType = normalizeBeerType(target.value)

  await replaceQuery({
    type: nextType,
    page: '1'
  })
}

const goToPage = async (nextPage: number): Promise<void> => {
  await replaceQuery({
    type: beerType.value,
    pricemax: priceMax.value === null ? undefined : String(priceMax.value),
    page: String(nextPage)
  })
}

const items = computed(() => data.value?.items ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => data.value?.totalPages ?? 1)
const serverPage = computed(() => data.value?.page ?? 1)
</script>

<template>
  <section class="space-y-4">
    <div class="breadcrumbs text-sm">
      <ul>
        <li>
          <NuxtLink to="/">Accueil</NuxtLink>
        </li>
        <li>Bieres serveur</li>
      </ul>
    </div>

    <div class="tabs tabs-box border-2 border-base-300 bg-base-100 p-1">
      <NuxtLink :to="`/bieres?type=${beerType}`" class="tab">Preview</NuxtLink>
      <NuxtLink :to="`/bieres-client?type=${beerType}`" class="tab">Client</NuxtLink>
      <NuxtLink to="/bieres-serveur" class="tab tab-active">Serveur</NuxtLink>
    </div>

    <div class="card border-2 border-base-300 bg-base-100">
      <div class="card-body p-4">
        <h1 class="card-title text-2xl">/bieres-serveur</h1>

        <form class="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" @submit.prevent="applyFilters">
          <select class="select select-bordered select-sm" :value="beerType" @change="onTypeChange">
            <option value="ale">IPA / Ale</option>
            <option value="stouts">Stouts</option>
          </select>

          <input v-model="priceInput" type="text" inputmode="decimal" placeholder="Prix max ($)"
            class="input input-bordered input-sm">

          <button type="submit" class="btn btn-primary btn-sm">Appliquer</button>
          <button type="button" class="btn btn-ghost btn-sm" @click="resetFilters">Réinitialiser</button>
        </form>

        <p class="mt-2 text-sm text-base-content/70">
          {{ total }} resultats - page {{ serverPage }} / {{ totalPages }}
        </p>
      </div>
    </div>

    <div v-if="error" class="alert alert-error">
      <span>Impossible de charger les bieres cote serveur.</span>
    </div>

    <BeerGrid :beers="items" :type="beerType" details-base-path="/bieres-serveur" :loading="pending"
      empty-message="Aucune biere ne correspond au filtre serveur." />

    <div class="join">
      <button class="join-item btn" :disabled="serverPage <= 1" @click="goToPage(serverPage - 1)">
        Precedent
      </button>
      <button class="join-item btn" :disabled="serverPage >= totalPages" @click="goToPage(serverPage + 1)">
        Suivant
      </button>
    </div>
  </section>
</template>
