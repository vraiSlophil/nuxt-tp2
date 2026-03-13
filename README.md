# TD4 - bieres

Nathan OUDER

## Lancer

```bash
docker compose up
```

phpMyAdmin est aussi disponible via Docker sur `http://localhost:8080`.

## Pages

- `/` : accueil TD4
- `/bieres` : preview par type
- `/bieres-client` : liste chargee cote client avec store Pinia
- `/bieres-client/:id` : detail client
- `/bieres-serveur` : liste chargee cote serveur via la route API Nuxt
- `/bieres-serveur/:id` : detail serveur
- `/favoris` : favoris stockes dans MySQL via `/api/favorites`

## API favorites

- `GET /api/favorites` : liste les bieres favorites stockees en base
- `POST /api/favorites` : ajoute ou remet a jour un favori avec `{ "beerId": 1, "beerType": "ale" }`
- `DELETE /api/favorites` : retire un favori avec le meme payload

La table `favorite_beers` est creee automatiquement au premier appel API si elle n'existe pas.
