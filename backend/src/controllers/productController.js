const Product = require('../models/Product');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const listProducts = asyncHandler(async (req, res) => {
  const { search, sort, category, brand, featured, minPrice, maxPrice, inStock } = req.query;
  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  if (category) {
    filter.category = category;
  }
  if (brand) {
    filter.brand = brand;
  }
  if (featured === 'true') {
    filter.featured = true;
  }
  if (inStock === 'true') {
    filter.stock = { $gt: 0 };
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let query = Product.find(filter);

  switch (sort) {
    case 'Z-A':
      query = query.sort({ name: -1 });
      break;
    case 'Latest':
      query = query.sort({ createdAt: -1 });
      break;
    case 'price-asc':
      query = query.sort({ price: 1 });
      break;
    case 'price-desc':
      query = query.sort({ price: -1 });
      break;
    case 'A-Z':
    default:
      query = query.sort({ name: 1 });
      break;
  }

  const products = await query.exec();
  res.json({ success: true, data: products.map((p) => p.toClientJSON()) });
});

// Distinct categories/brands actually present in the catalog, so the landing
// page and filters only ever show options that return real results.
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json({ success: true, data: categories.filter(Boolean).sort() });
});

const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand');
  res.json({ success: true, data: brands.filter(Boolean).sort() });
});

// Real "best sellers": aggregated from actual order line items rather than a
// client-side placeholder. Falls back to nothing (never fake data) if the
// store has no orders yet - the landing page hides the section in that case.
const getBestSellers = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const ranked = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.product', unitsSold: { $sum: '$items.quantity' } } },
    { $sort: { unitsSold: -1 } },
    { $limit: limit },
  ]);

  const products = await Product.find({ _id: { $in: ranked.map((r) => r._id) } });
  const byId = new Map(products.map((p) => [p._id.toString(), p]));
  const ordered = ranked
    .map((r) => byId.get(String(r._id)))
    .filter(Boolean)
    .map((p) => p.toClientJSON());

  res.json({ success: true, data: ordered });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  res.json({ success: true, data: product.toClientJSON() });
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, compareAtPrice, brand, description, image, storeLocation, category, stock, featured } =
    req.body;

  if (!name || price === undefined || price === null) {
    throw new ApiError(400, 'name and price are required');
  }
  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice) || numericPrice < 0) {
    throw new ApiError(400, 'price must be a non-negative number');
  }

  const product = await Product.create({
    name,
    price: numericPrice,
    compareAtPrice: compareAtPrice !== undefined ? Number(compareAtPrice) : null,
    brand,
    description,
    image,
    storeLocation,
    category,
    stock: stock !== undefined ? Number(stock) : 0,
    featured: featured === true,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: product.toClientJSON() });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  if (String(product.createdBy) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only edit your own products');
  }

  const { name, price, compareAtPrice, brand, description, image, storeLocation, category, stock, featured } =
    req.body;
  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = Number(price);
  if (compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice === null ? null : Number(compareAtPrice);
  if (brand !== undefined) product.brand = brand;
  if (description !== undefined) product.description = description;
  if (image !== undefined) product.image = image;
  if (storeLocation !== undefined) product.storeLocation = storeLocation;
  if (category !== undefined) product.category = category;
  if (featured !== undefined) product.featured = featured === true;
  if (stock !== undefined) product.stock = Number(stock);

  await product.save();
  res.json({ success: true, data: product.toClientJSON() });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  if (String(product.createdBy) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own products');
  }
  await product.deleteOne();
  res.json({ success: true, data: null });
});

module.exports = {
  listProducts,
  getCategories,
  getBrands,
  getBestSellers,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
