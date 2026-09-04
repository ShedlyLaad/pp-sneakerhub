import client from './client';

export function fetchFavorites() {
  return client.get('/favorites');
}

export function addFavorite(productId) {
  return client.post(`/favorites/${productId}`);
}

export function removeFavorite(productId) {
  return client.delete(`/favorites/${productId}`);
}
