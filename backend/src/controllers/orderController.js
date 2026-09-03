const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getOrCreateCart } = require('./cartController');

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;
  if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.country) {
    throw new ApiError(400, 'shippingAddress with line1, city and country is required');
  }

  const cart = await getOrCreateCart(req.user._id);
  await cart.populate('items.product');

  const validItems = cart.items.filter((item) => item.product);
  if (validItems.length === 0) {
    throw new ApiError(400, 'Your cart is empty');
  }

  const orderItems = validItems.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const total = Number(
    orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)
  );

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    total,
    shippingAddress,
    status: 'pending',
  });

  // Empty the cart after a successful order
  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, data: order });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  if (String(order.user) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You cannot view this order');
  }
  res.json({ success: true, data: order });
});

module.exports = { createOrder, listMyOrders, getOrder };
