import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDir, '..')
const envFilePath = resolve(projectRoot, '.env')
const schemaFilePath = resolve(projectRoot, 'database/schema.sql')

const parseEnvFile = async (filePath) => {
  try {
    const content = await readFile(filePath, 'utf8')

    return content.split(/\r?\n/).reduce((env, line) => {
      const trimmedLine = line.trim()

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return env
      }

      const separatorIndex = trimmedLine.indexOf('=')

      if (separatorIndex === -1) {
        return env
      }

      const key = trimmedLine.slice(0, separatorIndex).trim()
      const rawValue = trimmedLine.slice(separatorIndex + 1).trim()
      const value = rawValue.replace(/^['"]|['"]$/g, '')

      env[key] = value

      return env
    }, {})
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return {}
    }

    throw error
  }
}

const envFile = await parseEnvFile(envFilePath)

const getConfigValue = (key, fallback = '') => {
  return process.env[key] ?? envFile[key] ?? fallback
}

const parsePort = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ''), 10)

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback
  }

  return parsed
}

const escapeIdentifier = (identifier) => {
  if (!/^[A-Za-z0-9_$]+$/.test(identifier)) {
    throw new Error(`Nom de base invalide: ${identifier}`)
  }

  return `\`${identifier}\``
}

const database = getConfigValue('MYSQL_DATABASE', 'nuxt_tp2')
const host = getConfigValue('MYSQL_HOST', '127.0.0.1')
const password = getConfigValue('MYSQL_PASSWORD', '')
const port = parsePort(getConfigValue('MYSQL_PORT', '3306'), 3306)
const user = getConfigValue('MYSQL_USER', 'root')
const schemaSql = await readFile(schemaFilePath, 'utf8')

const connection = await mysql.createConnection({
  host,
  multipleStatements: true,
  password,
  port,
  user
})

try {
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS ${escapeIdentifier(database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  )
  await connection.changeUser({ database })
  await connection.query(schemaSql)

  process.stdout.write(`Schema applique sur ${database} (${host}:${port})\n`)
} finally {
  await connection.end()
}
