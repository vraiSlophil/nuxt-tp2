import { createError, readBody } from 'h3'
import { parseFavoriteBeerPayload, saveFavoriteBeer } from '#server/utils/favorites'

const isHandledError = (error: unknown): error is { statusCode: number } => {
  return Boolean(error && typeof error === 'object' && 'statusCode' in error)
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const payload = parseFavoriteBeerPayload(body)
    const favorite = await saveFavoriteBeer(event, payload)

    return {
      favorite,
      ok: true
    }
  } catch (error) {
    if (isHandledError(error)) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible d enregistrer ce favori',
      data: error
    })
  }
})
