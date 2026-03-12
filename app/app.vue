<script setup lang="ts">
const links = [
  { to: '/', label: 'Accueil', icon: 'home' },
  { to: '/bieres', label: 'Bieres', icon: 'local_bar' },
  { to: '/bieres-client', label: 'Client', icon: 'computer' },
  { to: '/bieres-serveur', label: 'Serveur', icon: 'dns' },
  { to: '/favoris', label: 'Favoris', icon: 'favorite' }
]
</script>

<template>
  <div data-theme="mytheme" class="min-h-screen bg-base-200 text-base-content">
    <NuxtRouteAnnouncer />

    <div class="drawer lg:drawer-open">
      <input id="main-drawer" type="checkbox" class="drawer-toggle">

      <div class="drawer-content min-h-screen">
        <header class="navbar border-b border-base-300 bg-base-100 px-4">
          <div class="flex-none lg:hidden">
            <label for="main-drawer" class="btn btn-square btn-ghost" aria-label="Ouvrir le menu">
              <span class="material-symbols-rounded text-[20px] ">menu</span>
            </label>
          </div>

          <div class="flex-1">
            <NuxtLink to="/" class="text-xl pl-4 font-bold">TD3 Bieres</NuxtLink>
          </div>
        </header>

        <main class="mx-auto w-full max-w-6xl p-4 md:p-6">
          <NuxtPage />
        </main>
      </div>

      <div class="drawer-side z-40">
        <label for="main-drawer" class="drawer-overlay" aria-label="Fermer le menu" />

        <aside class="min-h-full w-72 border-r border-base-300 bg-base-100 p-4">
          <h2 class="mb-3 text-lg font-semibold">Pages TD3</h2>

          <ul class="menu w-full gap-1 bg-base-100 p-0">
            <li v-for="link in links" :key="link.to">
              <NuxtLink :to="link.to" active-class="menu-active" exact-active-class="menu-active"
                class="btn btn-ghost flex-row items-center">
                <span class="material-symbols-rounded text-[18px] basis-1/4">{{ link.icon }}</span>
                <span class="basis-3/4">{{ link.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </aside>
      </div>
    </div>

    <AppToastStack />
  </div>
</template>
