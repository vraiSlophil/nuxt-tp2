<script setup lang="ts">
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
</script>

<template>
  <section class="space-y-6">
    <div class="hero rounded-box border-2 border-base-300 bg-base-100">
      <div class="hero-content text-center">
        <div class="max-w-3xl space-y-4">
          <div class="badge badge-outline px-4 py-3">TP5 · Sessions et middleware</div>
          <h1 class="text-3xl font-bold md:text-4xl">TD5 Bières</h1>
          <p class="text-base-content/80">
            Comptes utilisateurs, session Nuxt, middleware de protection et favoris rattachés à un UUID.
          </p>

          <div class="join flex-wrap justify-center">
            <NuxtLink to="/bieres" class="btn join-item btn-primary">Commencer</NuxtLink>
            <NuxtLink to="/favoris" class="btn join-item btn-outline">Voir les favoris</NuxtLink>
            <NuxtLink :to="user ? '/profil' : '/login'" class="btn join-item btn-secondary">
              {{ user ? 'Ouvrir mon profil' : 'Se connecter' }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <NuxtLink to="/bieres" class="card border-2 border-base-300 bg-base-100 transition ">
        <div class="card-body">
          <h3 class="card-title text-lg">Bières</h3>
          <p>Preview rapide par type (ale / stouts).</p>
        </div>
      </NuxtLink>

      <NuxtLink to="/bieres-client" class="card border-2 border-base-300 bg-base-100 transition ">
        <div class="card-body">
          <h3 class="card-title text-lg">Bières client</h3>
          <p>Chargement dans le navigateur via le store Pinia.</p>
        </div>
      </NuxtLink>

      <NuxtLink to="/bieres-serveur" class="card border-2 border-base-300 bg-base-100 transition ">
        <div class="card-body">
          <h3 class="card-title text-lg">Bières serveur</h3>
          <p>Chargement SSR via la route API Nuxt, puis rendu au client.</p>
        </div>
      </NuxtLink>

      <NuxtLink to="/favoris" class="card border-2 border-base-300 bg-base-100 transition ">
        <div class="card-body">
          <h3 class="card-title text-lg">Favoris</h3>
          <p>Favoris stockés dans MySQL et filtrés par utilisateur connecté.</p>
        </div>
      </NuxtLink>

      <NuxtLink to="/login" class="card border-2 border-base-300 bg-base-100 transition ">
        <div class="card-body">
          <h3 class="card-title text-lg">Login</h3>
          <p>Connexion via API Nuxt et session serveur.</p>
        </div>
      </NuxtLink>

      <NuxtLink to="/register" class="card border-2 border-base-300 bg-base-100 transition ">
        <div class="card-body">
          <h3 class="card-title text-lg">Register</h3>
          <p>Création de compte avec hash Argon2id.</p>
        </div>
      </NuxtLink>

      <NuxtLink to="/profil" class="card border-2 border-base-300 bg-base-100 transition ">
        <div class="card-body">
          <h3 class="card-title text-lg">Profil</h3>
          <p>Page protégée par middleware avec déconnexion.</p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
