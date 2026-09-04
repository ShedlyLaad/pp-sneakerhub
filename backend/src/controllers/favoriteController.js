const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const listFavorites = asyncHandler(async (req, res) => {
  const products = await Product.find({ _id: { $in: req.user.favorites } });
  // Preserve the order favorites were added in rather than natural Mongo order.
  const byId = new Map(products.map((p) => [p._id.toString(), p]));
  const ordered = req.user.favorites
    .map((id) => byId.get(id.toString()))
    .filter(Boolean)
    .map((p) => p.toClientJSON());
  res.json({ success: true, data: ordered });
});

const addFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const already = req.user.favorites.some((id) => String(id) === String(productId));
  if (!already) {
    req.user.favorites.push(productId);
    await req.user.save();
  }
  res.status(201).json({ success: true, data: { favoriteIds: req.user.favorites.map(String) } });
});

const removeFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  req.user.favorites = req.user.favorites.filter((id) => String(id) !== String(productId));
  await req.user.save();
  res.json({ success: true, data: { favoriteIds: req.user.favorites.map(String) } });
});

module.exports = { listFavorites, addFavorite, removeFavorite };
