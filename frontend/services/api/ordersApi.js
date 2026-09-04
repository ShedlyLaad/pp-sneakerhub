import client from './client';

export function createOrder({ addressId, shippingAddress }) {
  return client.post('/orders', { addressId, shippingAddress });
}

export function fetchMyOrders() {
  return client.get('/orders');
}

export function fetchOrder(id) {
  return client.get(`/orders/${id}`);
}
