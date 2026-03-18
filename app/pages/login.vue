<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const { pending } = storeToRefs(authStore)

const form = reactive({
  login: '',
  password: ''
})

const redirectPath = computed(() => {
  return typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
    ? route.query.redirect
    : '/profil'
})

const submit = async (): Promise<void> => {
  if (pending.value) {
    return
  }

  const user = await authStore.login({
    login: form.login,
    password: form.password
  })

  if (user) {
    await router.push(redirectPath.value)
  }
}
</script>

<template>
  <div class="card m-auto w-xl md:w-2xl sm:w-full border-2 border-base-300 bg-base-100 shadow-sm">
    <div class="card-body gap-4">
      <div class="space-y-1">
        <h2 class="card-title text-2xl">Se connecter</h2>
        <p class="text-sm text-base-content/70">Entre ton login et ton mot de passe.</p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Login</legend>
          <label class="input input-bordered flex items-center gap-2 w-full">
            <span class="material-symbols-rounded text-base-content/55">person</span>
            <input v-model.trim="form.login" type="text" placeholder="nathan" autocomplete="username" required>
          </label>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Mot de passe</legend>
          <label class="input input-bordered flex items-center gap-2 w-full">
            <span class="material-symbols-rounded text-base-content/55">password</span>
            <input v-model="form.password" type="password" placeholder="********" autocomplete="current-password"
              minlength="8" required>
          </label>
        </fieldset>

        <button type="submit" class="btn btn-primary w-full" :disabled="pending">
          <span class="material-symbols-rounded text-[18px]">login</span>
          Se connecter
        </button>
      </form>

      <div class="divider my-1">ou</div>

      <NuxtLink to="/register" class="btn btn-outline w-full">
        <span class="material-symbols-rounded text-[18px]">person_add</span>
        Créer un compte
      </NuxtLink>
    </div>
  </div>
</template>
