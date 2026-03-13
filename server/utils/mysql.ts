import bluebird from 'bluebird'
import mysql from 'mysql2/promise'
import type { H3Event } from 'h3'
import type { Pool, PoolOptions } from 'mysql2/promise'

let pool: Pool | null = null
let poolKey = ''

const parsePort = (value: unknown, fallback: number): number => {
  const parsed = Number.parseInt(String(value ?? ''), 10)

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback
  }

  return parsed
}

const getPoolConfig = (event?: H3Event): PoolOptions => {
  const config = useRuntimeConfig(event)

  return {
    host: config.mysqlHost,
    port: parsePort(config.mysqlPort, 3306),
    user: config.mysqlUser,
    password: config.mysqlPassword,
    database: config.mysqlDatabase,
    connectionLimit: 10,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    queueLimit: 0,
    waitForConnections: true,
    Promise: bluebird
  }
}

const getPoolKey = (config: PoolOptions): string => {
  return [
    config.host,
    config.port,
    config.user,
    config.database
  ].join('|')
}

export const getMysqlPool = (event?: H3Event): Pool => {
  const config = getPoolConfig(event)
  const nextPoolKey = getPoolKey(config)

  if (!pool || poolKey !== nextPoolKey) {
    pool = mysql.createPool(config)
    poolKey = nextPoolKey
  }

  return pool
}

export const getMysqlPoolSignature = (event?: H3Event): string => {
  return getPoolKey(getPoolConfig(event))
}
