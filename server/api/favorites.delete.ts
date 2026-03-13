import { createError, readBody } from 'h3'
import { parseFavoriteBeerPayload, removeFavoriteBeer } from '#server/utils/favorites'

const isHandledError = (error: unknown): error is { statusCode: number } => {
  return Boolean(error && typeof error === 'object' && 'statusCode' in error)
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const payload = parseFavoriteBeerPayload(body)
    const deleted = await removeFavoriteBeer(event, payload)

    return {
      deleted,
      ok: true
    }
  } catch (error) {
    if (isHandledError(error)) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de supprimer ce favori',
      data: error
    })
  }
})
