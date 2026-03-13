import { createError } from 'h3'
import { listFavoriteBeers } from '#server/utils/favorites'

const isHandledError = (error: unknown): error is { statusCode: number } => {
  return Boolean(error && typeof error === 'object' && 'statusCode' in error)
}

export default defineEventHandler(async (event) => {
  try {
    return await listFavoriteBeers(event)
  } catch (error) {
    if (isHandledError(error)) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de recuperer les favoris',
      data: error
    })
  }
})
