import { createError } from 'h3'
import type { H3Event } from 'h3'
import type { SessionUser } from '~~/utils/auth'
import { toSessionUser } from '~~/utils/auth'

export const getSessionUser = (event: H3Event): SessionUser | null => {
  return toSessionUser(event.context.session.user)
}

export const requireSessionUser = (event: H3Event): SessionUser => {
  const user = getSessionUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentification requise'
    })
  }

  return user
}

export const setSessionUser = (event: H3Event, user: SessionUser): void => {
  event.context.session.user = user
}

export const clearSessionUser = (event: H3Event): void => {
  delete event.context.session.user
}
