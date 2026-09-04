const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getOrCreateCart } = require('./cartController');

function resolveShippingAddress(req, addressId, shippingAddress) {
  if (addressId) {
    const saved = req.user.addresses.id(addressId);
    if (!saved) {
      throw new ApiError(404, 'Address not found');
    }
    return {
      line1: saved.line1,
      city: saved.city,
      postalCode: saved.postalCode,
      country: saved.country,
    };
  }

  if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.country) {
    throw new ApiError(400, 'Provide an addressId or a shippingAddress with line1, city and country');
  }
  return {
    line1: shippingAddress.line1,
    city: shippingAddress.city,
    postalCode: shippingAddress.postalCode || '',
    country: shippingAddress.country,
  };
}

const createOrder = asyncHandler(async (req, res) => {
  const { addressId, shippingAddress } = req.body;
  const resolvedAddress = resolveShippingAddress(req, addressId, shippingAddress);

  const cart = await getOrCreateCart(req.user._id);
  await cart.populate('items.product');

  const validItems = cart.items.filter((item) => item.product);
  if (validItems.length === 0) {
    throw new ApiError(400, 'Your cart is empty');
  }

  // The backend is the source of truth for stock and pricing: decrement each
  // product atomically (a single conditional update, so two concurrent
  // checkouts can never both succeed past the last unit), then price the
  // order off the price that update just confirmed - never the client's.
  //
  // The database here is a standalone MongoDB instance (no replica set), so
  // multi-document ACID transactions aren't available. Each decrement is
  // still atomic on its own; if a later item in the cart fails, the ones
  // already decremented are restored (compensation) before reporting the error.
  const decremented = [];
  try {
    const orderItems = [];
    for (const item of validItems) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!product) {
        const current = await Product.findById(item.product._id);
        if (!current) {
          throw new ApiError(404, `Product no longer available: ${item.product.name}`);
        }
        throw new ApiError(
          409,
          `Insufficient stock for "${current.name}" (only ${current.stock} left, ${item.quantity} requested)`
        );
      }

      decremented.push({ productId: product._id, quantity: item.quantity });
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const total = Number(orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2));

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total,
      shippingAddress: resolvedAddress,
      status: 'pending',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    await Promise.all(
      decremented.map((d) => Product.updateOne({ _id: d.productId }, { $inc: { stock: d.quantity } }))
    );
    throw err;
  }
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
