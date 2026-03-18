import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  AuthCredentialsPayload,
  AuthUserResponse,
  SessionUser
} from '~~/utils/auth'
import { getErrorMessage, toSessionUser } from '~~/utils/auth'

export const useAuthStore = defineStore('auth', () => {
  const toastStore = useToastStore()
  const errorMessage = ref('')
  const pending = ref(false)
  const ready = ref(false)
  const user = ref<SessionUser | null>(null)

  const clearError = (): void => {
    errorMessage.value = ''
  }

  const reportError = (message: string): void => {
    errorMessage.value = message

    if (import.meta.client) {
      toastStore.error(message, { title: 'Authentification' })
    }
  }

  const syncFromSession = (sessionUser: unknown): SessionUser | null => {
    user.value = toSessionUser(sessionUser)
    ready.value = true

    return user.value
  }

  const resetRelatedState = (): void => {
    useFavoritesStore().resetState()
  }

  const login = async (credentials: AuthCredentialsPayload): Promise<SessionUser | null> => {
    clearError()
    pending.value = true

    try {
      const response = await $fetch<AuthUserResponse>('/api/auth/login', {
        body: credentials,
        method: 'POST'
      })

      resetRelatedState()
      syncFromSession(response.user)

      return response.user
    } catch (error) {
      reportError(getErrorMessage(error, 'Impossible de se connecter.'))
      return null
    } finally {
      pending.value = false
    }
  }

  const register = async (credentials: AuthCredentialsPayload): Promise<SessionUser | null> => {
    clearError()
    pending.value = true

    try {
      const response = await $fetch<AuthUserResponse>('/api/auth/register', {
        body: credentials,
        method: 'POST'
      })

      resetRelatedState()
      syncFromSession(response.user)

      return response.user
    } catch (error) {
      reportError(getErrorMessage(error, 'Impossible de créer le compte.'))
      return null
    } finally {
      pending.value = false
    }
  }

  const logout = async (): Promise<boolean> => {
    clearError()
    pending.value = true

    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })

      resetRelatedState()
      syncFromSession(null)
      return true
    } catch (error) {
      reportError(getErrorMessage(error, 'Impossible de se déconnecter.'))
      return false
    } finally {
      pending.value = false
    }
  }

  return {
    errorMessage,
    pending,
    ready,
    user,
    clearError,
    reportError,
    syncFromSession,
    login,
    logout,
    register
  }
})
