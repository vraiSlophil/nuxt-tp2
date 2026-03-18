import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
const devServerPort = Number.parseInt(process.env.NUXT_PORT ?? '3000', 10)

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@pinia/nuxt', 'nuxt-server-utils', '@sidebase/nuxt-session'],
  runtimeConfig: {
    mysqlDatabase: process.env.NUXT_MYSQL_DATABASE ?? process.env.MYSQL_DATABASE ?? 'nuxt_tp2',
    mysqlHost: process.env.NUXT_MYSQL_HOST ?? process.env.MYSQL_HOST ?? '127.0.0.1',
    mysqlPassword: process.env.NUXT_MYSQL_PASSWORD ?? process.env.MYSQL_PASSWORD ?? '',
    mysqlPort: process.env.NUXT_MYSQL_PORT ?? process.env.MYSQL_PORT ?? '3306',
    mysqlUser: process.env.NUXT_MYSQL_USER ?? process.env.MYSQL_USER ?? 'root'
  },
  session: {
    api: {
      methods: ['get']
    },
    session: {
      cookieSecure: process.env.NODE_ENV === 'production',
      expiryInSeconds: 60 * 60 * 24
    }
  },
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0'
        }
      ]
    }
  },
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: false,
        commaDangle: 'never'
      }
    }
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  devServer: {
    host: '0.0.0.0',
    port: Number.isNaN(devServerPort) ? 3000 : devServerPort
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()]
  }
})
