<template>
  <section class="space-y-6">
    <div class="hero rounded-box border-2 border-base-300 bg-base-100">
      <div class="hero-content text-center">
        <div class="max-w-3xl space-y-4">
          <h1 class="text-3xl font-bold md:text-4xl">TD3 Nuxt</h1>
          <p class="text-base-content/80">
            Parcours simple: liste des bieres, detail client/serveur, et gestion des favoris via Pinia.
          </p>

          <div class="join">
            <NuxtLink to="/bieres" class="btn join-item btn-primary">Commencer</NuxtLink>
            <NuxtLink to="/favoris" class="btn join-item btn-outline">Voir les favoris</NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <NuxtLink to="/bieres" class="card border-2 border-base-300 bg-base-100 transition ">
        <div class="card-body">
          <h3 class="card-title text-lg">Bieres</h3>
          <p>Preview rapide par type (ale / stouts).</p>
        </div>
      </NuxtLink>

      <NuxtLink to="/bieres-client" class="card border-2 border-base-300 bg-base-100 transition ">
        <div class="card-body">
          <h3 class="card-title text-lg">Bieres client</h3>
          <p>Chargement dans le navigateur via le store Pinia.</p>
        </div>
      </NuxtLink>

      <NuxtLink to="/bieres-serveur" class="card border-2 border-base-300 bg-base-100 transition ">
        <div class="card-body">
          <h3 class="card-title text-lg">Bieres serveur</h3>
          <p>Chargement SSR via la route API Nuxt, puis rendu au client.</p>
        </div>
      </NuxtLink>

      <NuxtLink to="/favoris" class="card border-2 border-base-300 bg-base-100 transition ">
        <div class="card-body">
          <h3 class="card-title text-lg">Favoris</h3>
          <p>Favoris stockes dans le navigateur avec <code>localStorage</code>.</p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
