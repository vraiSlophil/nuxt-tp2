<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { pending, user } = storeToRefs(authStore)
const router = useRouter()

const disconnect = async (): Promise<void> => {
  if (pending.value) {
    return
  }

  const loggedOut = await authStore.logout()

  if (loggedOut) {
    await router.push('/login')
  }
}
</script>

<template>
  <section class="mx-auto max-w-5xl space-y-6">
    <div class="hero rounded-box border-2 border-base-300 bg-base-100">
      <div class="hero-content w-full px-6 py-10">
        <div class="w-full space-y-6">
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex size-16 items-center justify-center rounded-full border-2 border-base-300 bg-base-100">
              <span class="material-symbols-rounded !text-5xl text-black">account_circle</span>
            </div>

            <div class="space-y-1">
              <p class="text-sm uppercase tracking-[0.2em] text-base-content/55">Session active</p>
              <h1 class="text-xl font-black">{{ user?.login }}</h1>
              <p class="mt-2 break-all text-sm font-medium">{{ user?.id }}</p>
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <NuxtLink to="/favoris" class="btn btn-primary">
              <p class="text-sm font-medium">Voir mes bières sauvegardées</p>
            </NuxtLink>

            <NuxtLink to="/bieres" class="btn btn-primary">
              <p class="text-sm font-medium">Ajouter de nouveaux favoris</p>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-2 border-base-300 bg-base-100">
      <div class="card-body gap-4 md:flex-row md:items-center md:justify-between">
        <div class="space-y-1">
          <h2 class="card-title text-xl">Déconnexion</h2>
          <p class="text-sm text-base-content/70">
            La session serveur sera vidée et l'accès aux pages protégées sera coupé.
          </p>
        </div>

        <button type="button" class="btn btn-error" :class="{ loading: pending }" :disabled="pending"
          @click="disconnect">
          <span class="material-symbols-rounded text-[18px]">logout</span>
          Se déconnecter
        </button>
      </div>
    </div>
  </section>
</template>
