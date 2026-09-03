import client from './client';

export function createOrder({ shippingAddress }) {
  return client.post('/orders', { shippingAddress });
}

export function fetchMyOrders() {
  return client.get('/orders');
}

export function fetchOrder(id) {
  return client.get(`/orders/${id}`);
}
