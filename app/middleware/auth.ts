export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const { refresh, session } = await useSession()

  let user = authStore.syncFromSession(session.value?.user)

  if (!user) {
    await refresh()
    user = authStore.syncFromSession(session.value?.user)
  }

  if (!user) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
  }
})
