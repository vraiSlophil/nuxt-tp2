import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import type { H3Event } from 'h3'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import type { AuthCredentialsPayload, SessionUser } from '~~/utils/auth'
import { getMysqlPool } from '#server/utils/mysql'
import { hashPassword, verifyPassword } from '#server/utils/passwords'

interface UserRow extends RowDataPacket {
  id: string
  login: string
  passwordHash: string
}

const LOGIN_MIN_LENGTH = 3
const LOGIN_MAX_LENGTH = 64
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128

const createInvalidCredentialsError = () => {
  return createError({
    statusCode: 401,
    statusMessage: 'Login ou mot de passe incorrect'
  })
}

const isDuplicateEntryError = (error: unknown): boolean => {
  const candidate = error as { code?: string } | null

  return candidate?.code === 'ER_DUP_ENTRY'
}

const normalizeLogin = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Login invalide'
    })
  }

  const login = value.trim()

  if (login.length < LOGIN_MIN_LENGTH || login.length > LOGIN_MAX_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Le login doit contenir entre ${LOGIN_MIN_LENGTH} et ${LOGIN_MAX_LENGTH} caractères`
    })
  }

  return login
}

const normalizePassword = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Mot de passe invalide'
    })
  }

  if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Le mot de passe doit contenir entre ${PASSWORD_MIN_LENGTH} et ${PASSWORD_MAX_LENGTH} caractères`
    })
  }

  return value
}

const toSessionUser = (row: Pick<UserRow, 'id' | 'login'>): SessionUser => {
  return {
    id: row.id,
    login: row.login
  }
}

const findUserByLogin = async (event: H3Event, login: string): Promise<UserRow | null> => {
  const [rows] = await getMysqlPool(event).execute<UserRow[]>(
    `
      SELECT
        id,
        login,
        password_hash AS passwordHash
      FROM users
      WHERE login = ?
      LIMIT 1
    `,
    [login]
  )

  return rows[0] ?? null
}

export const parseAuthCredentials = (body: unknown): AuthCredentialsPayload => {
  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Corps de requête invalide'
    })
  }

  const payload = body as Record<string, unknown>

  return {
    login: normalizeLogin(payload.login),
    password: normalizePassword(payload.password)
  }
}

export const registerUser = async (
  event: H3Event,
  credentials: AuthCredentialsPayload
): Promise<SessionUser> => {
  const existingUser = await findUserByLogin(event, credentials.login)

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Ce login existe déjà'
    })
  }

  const id = randomUUID()
  const passwordHash = await hashPassword(credentials.password)

  try {
    await getMysqlPool(event).execute<ResultSetHeader>(
      `
        INSERT INTO users (id, login, password_hash)
        VALUES (?, ?, ?)
      `,
      [id, credentials.login, passwordHash]
    )
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Ce login existe déjà'
      })
    }

    throw error
  }

  return {
    id,
    login: credentials.login
  }
}

export const authenticateUser = async (
  event: H3Event,
  credentials: AuthCredentialsPayload
): Promise<SessionUser> => {
  const user = await findUserByLogin(event, credentials.login)

  if (!user) {
    throw createInvalidCredentialsError()
  }

  const isValidPassword = await verifyPassword(user.passwordHash, credentials.password)

  if (!isValidPassword) {
    throw createInvalidCredentialsError()
  }

  return toSessionUser(user)
}
