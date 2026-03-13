import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
const devServerPort = Number.parseInt(process.env.NUXT_PORT ?? '3000', 10)

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@pinia/nuxt'],
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
