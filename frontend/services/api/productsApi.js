import client from './client';

export function fetchProducts({ search, sort, category } = {}) {
  return client.get('/products', { params: { search, sort, category } });
}

export function fetchProduct(id) {
  return client.get(`/products/${id}`);
}

export function createProduct(payload) {
  return client.post('/products', payload);
}

export function updateProduct(id, payload) {
  return client.patch(`/products/${id}`, payload);
}

export function deleteProduct(id) {
  return client.delete(`/products/${id}`);
}
