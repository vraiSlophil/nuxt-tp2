<script setup lang="ts">
import type { BeerType } from '~~/utils/beers'
import {
  DEFAULT_PER_PAGE,
  normalizeBeerType,
  parsePositiveInt,
  parsePriceMax,
  parseSearchTerm
} from '~~/utils/beers'

const route = useRoute()
const router = useRouter()
const beersStore = useBeersStore()

const priceInput = ref('')
const searchInput = ref('')
const perPage = DEFAULT_PER_PAGE

const beerType = computed<BeerType>(() => {
  return normalizeBeerType(route.query.type)
})

const page = computed<number>(() => {
  return parsePositiveInt(route.query.page, 1)
})

const priceMax = computed<number | null>(() => {
  return parsePriceMax(route.query.pricemax)
})

const search = computed<string>(() => {
  return parseSearchTerm(route.query.search)
})

watch(
  priceMax,
  (value) => {
    priceInput.value = value === null ? '' : String(value)
  },
  { immediate: true }
)

watch(
  search,
  (value) => {
    searchInput.value = value
  },
  { immediate: true }
)

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

const fetchClientBeers = async (): Promise<void> => {
  await beersStore.ensureBeers(beerType.value)
}

watch(
  beerType,
  async (nextType, previousType) => {
    if (import.meta.client && nextType !== previousType) {
      await fetchClientBeers()
    }
  }
)

onMounted(async () => {
  if (import.meta.client) {
    await fetchClientBeers()
  }
})

const pagination = computed(() => {
  return beersStore.getPagination(beerType.value, {
    priceMax: priceMax.value,
    search: search.value,
    page: page.value,
    perPage
  })
})

const applyFilters = async (): Promise<void> => {
  const parsedPrice = parsePriceMax(priceInput.value)
  const parsedSearch = parseSearchTerm(searchInput.value)

  await replaceQuery({
    type: beerType.value,
    pricemax: parsedPrice === null ? undefined : String(parsedPrice),
    search: parsedSearch.length === 0 ? undefined : parsedSearch,
    page: '1'
  })
}

const resetFilters = async (): Promise<void> => {
  priceInput.value = ''
  searchInput.value = ''

  await replaceQuery({
    type: beerType.value,
    pricemax: undefined,
    search: undefined,
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
    search: search.value.length === 0 ? undefined : search.value,
    page: String(nextPage)
  })
}

const pending = computed(() => {
  return beersStore.getPending(beerType.value)
})

const errorMessage = computed(() => {
  return beersStore.getError(beerType.value)
})

useErrorToast(errorMessage, { title: 'Chargement des bières client' })
</script>

<template>
  <section class="space-y-4">
    <div class="breadcrumbs text-sm">
      <ul>
        <li>
          <NuxtLink to="/">Accueil</NuxtLink>
        </li>
        <li>Bières client</li>
      </ul>
    </div>

    <div class="tabs tabs-box border-2 border-base-300 bg-base-100 p-1">
      <NuxtLink :to="`/bieres?type=${beerType}`" class="tab">Preview</NuxtLink>
      <NuxtLink to="/bieres-client" class="tab tab-active">Client</NuxtLink>
      <NuxtLink :to="`/bieres-serveur?type=${beerType}`" class="tab">Serveur</NuxtLink>
    </div>

    <div class="card border-2 border-base-300 bg-base-100">
      <div class="card-body p-4">
        <h1 class="card-title text-2xl">/bieres-client</h1>

        <form class="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" @submit.prevent="applyFilters">
          <select class="select select-bordered select-sm" :value="beerType" @change="onTypeChange">
            <option value="ale">IPA / Ale</option>
            <option value="stouts">Stouts</option>
          </select>

          <input v-model="searchInput" type="search" placeholder="Rechercher une bière"
            class="input input-bordered input-sm">

          <input v-model="priceInput" type="text" inputmode="decimal" placeholder="Prix max ($)"
            class="input input-bordered input-sm">

          <button type="submit" class="btn btn-primary btn-sm">Appliquer</button>
          <button type="button" class="btn btn-ghost btn-sm" @click="resetFilters">Réinitialiser</button>
        </form>

        <p class="mt-2 text-sm text-base-content/70">
          {{ pagination.total }} résultats - page {{ pagination.page }} / {{ pagination.totalPages }}
        </p>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-error">
      <span>{{ errorMessage }}</span>
    </div>

    <BeerGrid :beers="pagination.items" :type="beerType" details-base-path="/bieres-client" :loading="pending"
      empty-message="Aucune bière ne correspond au filtre client." />

    <div class="join">
      <button class="join-item btn" :disabled="pagination.page <= 1" @click="goToPage(pagination.page - 1)">
        Précédent
      </button>
      <button class="join-item btn" :disabled="pagination.page >= pagination.totalPages"
        @click="goToPage(pagination.page + 1)">
        Suivant
      </button>
    </div>
  </section>
</template>
