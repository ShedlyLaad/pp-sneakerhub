const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const listProducts = asyncHandler(async (req, res) => {
  const { search, sort, category } = req.query;
  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  if (category) {
    filter.category = category;
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

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  res.json({ success: true, data: product.toClientJSON() });
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, storeLocation, category, stock } = req.body;

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
    description,
    image,
    storeLocation,
    category,
    stock: stock !== undefined ? Number(stock) : 0,
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

  const { name, price, description, image, storeLocation, category, stock } = req.body;
  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = Number(price);
  if (description !== undefined) product.description = description;
  if (image !== undefined) product.image = image;
  if (storeLocation !== undefined) product.storeLocation = storeLocation;
  if (category !== undefined) product.category = category;
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

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
