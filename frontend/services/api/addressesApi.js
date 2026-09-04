import client from './client';

export function fetchAddresses() {
  return client.get('/addresses');
}

export function createAddress(payload) {
  return client.post('/addresses', payload);
}

export function updateAddress(id, payload) {
  return client.patch(`/addresses/${id}`, payload);
}

export function deleteAddress(id) {
  return client.delete(`/addresses/${id}`);
}
