import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
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
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()]
  }
})
