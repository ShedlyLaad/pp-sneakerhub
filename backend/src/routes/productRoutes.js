const express = require('express');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', requireAuth, createProduct);
router.patch('/:id', requireAuth, updateProduct);
router.delete('/:id', requireAuth, deleteProduct);

module.exports = router;
