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
  password: '',
  passwordConfirmation: ''
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

  authStore.clearError()

  if (form.password !== form.passwordConfirmation) {
    authStore.reportError('Les mots de passe ne correspondent pas.')
    return
  }

  const user = await authStore.register({
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
        <h1 class="card-title text-2xl">Création de compte</h1>
        <p class="text-sm text-base-content/70">
          Un compte simple suffit pour rattacher des favoris à un utilisateur.
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Login</legend>
          <label class="input input-bordered flex items-center gap-2 w-full">
            <span class="material-symbols-rounded text-base-content/55">badge</span>
            <input v-model.trim="form.login" type="text" placeholder="nouvel-utilisateur" autocomplete="username"
              required>
          </label>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Mot de passe</legend>
          <label class="input input-bordered flex items-center gap-2 w-full">
            <span class="material-symbols-rounded text-base-content/55">lock</span>
            <input v-model="form.password" type="password" placeholder="minimum 8 caractères"
              autocomplete="new-password" minlength="8" required>
          </label>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Confirmation</legend>
          <label class="input input-bordered flex items-center gap-2 w-full">
            <span class="material-symbols-rounded text-base-content/55">verified_user</span>
            <input v-model="form.passwordConfirmation" type="password" placeholder="retape le mot de passe"
              autocomplete="new-password" minlength="8" required>
          </label>
        </fieldset>

        <button type="submit" class="btn btn-primary w-full" :disabled="pending">
          <span class="material-symbols-rounded text-[18px]">person_add</span>
          Créer mon compte
        </button>
      </form>

      <div class="divider my-1">déjà inscrit</div>

      <NuxtLink to="/login" class="btn btn-outline w-full">
        <span class="material-symbols-rounded text-[18px]">login</span>
        Aller à la connexion
      </NuxtLink>
    </div>
  </div>
</template>
