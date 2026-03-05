<script setup lang="ts">
import type { Beer, BeerType } from '~~/utils/beers'
import { normalizeBeerType, toBeerEndpoint } from '~~/utils/beers'

const route = useRoute()
const router = useRouter()

const beers = ref<Beer[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

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
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch<Beer[]>(toBeerEndpoint(beerType.value))
    beers.value = Array.isArray(response) ? response.slice(0, 6) : []
  } catch {
    beers.value = []
    errorMessage.value = 'Impossible de charger les bieres pour ce type.'
  } finally {
    isLoading.value = false
  }
}

watch(beerType, async () => {
  if (import.meta.client) {
    await fetchPreviewBeers()
  }
})

onMounted(() => {
  fetchPreviewBeers()
})
</script>

<template>
  <section class="space-y-4">
    <div class="breadcrumbs text-sm">
      <ul>
        <li>
          <NuxtLink to="/">Accueil</NuxtLink>
        </li>
        <li>Bieres</li>
      </ul>
    </div>

    <div class="tabs tabs-box border border-base-300 bg-base-100 p-1">
      <NuxtLink to="/bieres" class="tab tab-active">Preview</NuxtLink>
      <NuxtLink :to="`/bieres-client?type=${beerType}`" class="tab">Version client</NuxtLink>
      <NuxtLink :to="`/bieres-serveur?type=${beerType}`" class="tab">Version serveur</NuxtLink>
    </div>

    <div class="card border border-base-300 bg-base-100">
      <div class="card-body space-y-4">
        <h1 class="card-title text-2xl">/bieres</h1>
        <p class="text-sm text-base-content/80">
          Choisis un type et affiche les 6 premieres bieres. Cette page sert de point d'entree.
        </p>

        <fieldset class="fieldset w-full max-w-xs">
          <legend class="fieldset-legend">Type de biere</legend>
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
      empty-message="Aucune biere de preview pour ce type." />
  </section>
</template>
