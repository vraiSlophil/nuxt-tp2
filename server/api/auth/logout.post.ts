import { createError } from 'h3'
import { clearSessionUser } from '#server/utils/session'

const isHandledError = (error: unknown): error is { statusCode: number } => {
  return Boolean(error && typeof error === 'object' && 'statusCode' in error)
}

export default defineEventHandler(async (event) => {
  try {
    clearSessionUser(event)

    return {
      ok: true
    }
  } catch (error) {
    if (isHandledError(error)) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de déconnecter cet utilisateur',
      data: error
    })
  }
})
