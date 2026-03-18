<script setup lang="ts">
import type { BeerType } from '~~/utils/beers'
import { normalizeBeerType } from '~~/utils/beers'

const route = useRoute()
const router = useRouter()
const beersStore = useBeersStore()

const beerType = computed<BeerType>(() => {
  return normalizeBeerType(route.query.type)
})

const replaceType = async (type: BeerType): Promise<void> => {
  await router.replace({
    query: {
      ...route.query,
      type
    }
  })
}

const onTypeChange = async (event: Event): Promise<void> => {
  const target = event.target as HTMLSelectElement
  await replaceType(normalizeBeerType(target.value))
}

const fetchPreviewBeers = async (): Promise<void> => {
  await beersStore.ensureBeers(beerType.value)
}

watch(
  beerType,
  async (nextType, previousType) => {
    if (import.meta.client && nextType !== previousType) {
      await fetchPreviewBeers()
    }
  }
)

onMounted(async () => {
  if (import.meta.client) {
    await fetchPreviewBeers()
  }
})

const beers = computed(() => {
  return beersStore.getPreviewBeers(beerType.value)
})

const isLoading = computed(() => {
  return beersStore.getPending(beerType.value)
})

const errorMessage = computed(() => {
  return beersStore.getError(beerType.value)
})

useErrorToast(errorMessage, { title: 'Chargement des bières' })
</script>

<template>
  <section class="space-y-4">
    <div class="breadcrumbs text-sm">
      <ul>
        <li>
          <NuxtLink to="/">Accueil</NuxtLink>
        </li>
        <li>Bières</li>
      </ul>
    </div>

    <div class="tabs tabs-box border-2 border-base-300 bg-base-100 p-1">
      <NuxtLink to="/bieres" class="tab tab-active">Preview</NuxtLink>
      <NuxtLink :to="`/bieres-client?type=${beerType}`" class="tab">Version client</NuxtLink>
      <NuxtLink :to="`/bieres-serveur?type=${beerType}`" class="tab">Version serveur</NuxtLink>
    </div>

    <div class="card border-2 border-base-300 bg-base-100">
      <div class="card-body space-y-4">
        <h1 class="card-title text-2xl">/bieres</h1>
        <p class="text-sm text-base-content/80">
          Choisis un type et affiche les 6 premières bières. Cette page sert de point d'entrée.
        </p>

        <fieldset class="fieldset w-full max-w-xs">
          <legend class="fieldset-legend">Type de bière</legend>
          <select class="select select-bordered" :value="beerType" @change="onTypeChange">
            <option value="ale">IPA / Ale</option>
            <option value="stouts">Stouts</option>
          </select>
        </fieldset>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-error">
      <span>{{ errorMessage }}</span>
    </div>

    <BeerGrid :beers="beers" :type="beerType" details-base-path="/bieres-client" :loading="isLoading"
      empty-message="Aucune bière de preview pour ce type." />
  </section>
</template>
