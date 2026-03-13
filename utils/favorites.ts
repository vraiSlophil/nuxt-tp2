import type { Beer, BeerType } from '~~/utils/beers'

export interface FavoriteBeerPayload {
  beerId: number
  beerType: BeerType
}

export interface FavoriteBeerRecord {
  beerId: number
  beerType: BeerType
  favoritedAt: string
}

export interface FavoriteBeer extends Beer {
  favoriteType: BeerType
  favoritedAt: string
}
