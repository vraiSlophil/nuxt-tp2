export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()
  const { refresh, session } = await useSession()

  let user = authStore.syncFromSession(session.value?.user)

  if (!user) {
    await refresh()
    user = authStore.syncFromSession(session.value?.user)
  }

  if (user) {
    return navigateTo('/profil')
  }
})
