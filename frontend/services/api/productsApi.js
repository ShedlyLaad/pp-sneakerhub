import client from './client';

export function fetchProducts(
  { search, sort, category, brand, featured, minPrice, maxPrice, inStock } = {}
) {
  return client.get('/products', {
    params: { search, sort, category, brand, featured, minPrice, maxPrice, inStock },
  });
}

export function fetchProduct(id) {
  return client.get(`/products/${id}`);
}

export function fetchCategories() {
  return client.get('/products/categories');
}

export function fetchBrands() {
  return client.get('/products/brands');
}

export function fetchBestSellers(limit = 10) {
  return client.get('/products/bestsellers', { params: { limit } });
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
