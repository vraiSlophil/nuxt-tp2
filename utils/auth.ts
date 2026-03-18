export interface SessionUser {
  id: string
  login: string
}

export interface AuthCredentialsPayload {
  login: string
  password: string
}

export interface AuthUserResponse {
  ok: true
  user: SessionUser
}

export interface AuthLogoutResponse {
  ok: true
}

export const isSessionUser = (value: unknown): value is SessionUser => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const user = value as Record<string, unknown>

  return (
    typeof user.id === 'string' &&
    user.id.length > 0 &&
    typeof user.login === 'string' &&
    user.login.length > 0
  )
}

export const toSessionUser = (value: unknown): SessionUser | null => {
  if (!isSessionUser(value)) {
    return null
  }

  return {
    id: value.id,
    login: value.login
  }
}

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') {
    return fallback
  }

  const candidate = error as {
    data?: { statusMessage?: string }
    message?: string
    statusMessage?: string
  }

  if (typeof candidate.data?.statusMessage === 'string' && candidate.data.statusMessage.length > 0) {
    return candidate.data.statusMessage
  }

  if (typeof candidate.statusMessage === 'string' && candidate.statusMessage.length > 0) {
    return candidate.statusMessage
  }

  if (typeof candidate.message === 'string' && candidate.message.length > 0) {
    return candidate.message
  }

  return fallback
}
