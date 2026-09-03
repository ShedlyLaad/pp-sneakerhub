const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

function serializeCart(cart) {
  const items = cart.items
    .filter((item) => item.product) // drop items whose product was deleted
    .map((item) => ({
      product: item.product.toClientJSON ? item.product.toClientJSON() : item.product,
      quantity: item.quantity,
      lineTotal: Number((item.product.price * item.quantity).toFixed(2)),
    }));

  const total = Number(items.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2));
  return { items, total };
}

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate('items.product');
  res.json({ success: true, data: serializeCart(cart) });
});

const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) {
    throw new ApiError(400, 'productId is required');
  }
  const qty = quantity ? Number(quantity) : 1;
  if (Number.isNaN(qty) || qty < 1) {
    throw new ApiError(400, 'quantity must be a positive number');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((item) => String(item.product) === String(productId));
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.items.push({ product: productId, quantity: qty });
  }
  await cart.save();
  await cart.populate('items.product');
  res.status(201).json({ success: true, data: serializeCart(cart) });
});

const updateItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const qty = Number(quantity);
  if (Number.isNaN(qty) || qty < 1) {
    throw new ApiError(400, 'quantity must be a positive number (use DELETE to remove an item)');
  }

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => String(i.product) === String(productId));
  if (!item) {
    throw new ApiError(404, 'Item not found in cart');
  }
  item.quantity = qty;
  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, data: serializeCart(cart) });
});

const removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => String(i.product) !== String(productId));
  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, data: serializeCart(cart) });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json({ success: true, data: serializeCart(cart) });
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, getOrCreateCart, serializeCart };
