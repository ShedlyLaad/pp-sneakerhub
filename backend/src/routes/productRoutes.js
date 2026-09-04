const express = require('express');
const {
  listProducts,
  getCategories,
  getBrands,
  getBestSellers,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Specific routes must be declared before "/:id" or Express would try to
// resolve "categories"/"brands"/"bestsellers" as a product id.
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/bestsellers', getBestSellers);

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', requireAuth, createProduct);
router.patch('/:id', requireAuth, updateProduct);
router.delete('/:id', requireAuth, deleteProduct);

module.exports = router;
