import { createError, readBody } from 'h3'
import { setSessionUser } from '#server/utils/session'
import { authenticateUser, parseAuthCredentials } from '#server/utils/users'

const isHandledError = (error: unknown): error is { statusCode: number } => {
  return Boolean(error && typeof error === 'object' && 'statusCode' in error)
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const credentials = parseAuthCredentials(body)
    const user = await authenticateUser(event, credentials)

    setSessionUser(event, user)

    return {
      ok: true,
      user
    }
  } catch (error) {
    if (isHandledError(error)) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de connecter cet utilisateur',
      data: error
    })
  }
})
