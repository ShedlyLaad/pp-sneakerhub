import client from './client';

export function fetchCart() {
  return client.get('/cart');
}

export function addCartItem(productId, quantity = 1) {
  return client.post('/cart/items', { productId, quantity });
}

export function updateCartItem(productId, quantity) {
  return client.patch(`/cart/items/${productId}`, { quantity });
}

export function removeCartItem(productId) {
  return client.delete(`/cart/items/${productId}`);
}

export function clearCart() {
  return client.delete('/cart');
}
