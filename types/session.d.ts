import type { SessionUser } from '~~/utils/auth'

declare global {
  interface Session {
    user?: SessionUser
  }
}

export {}
