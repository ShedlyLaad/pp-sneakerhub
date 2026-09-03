const express = require('express');
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getCart);
router.post('/items', addItem);
router.patch('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);

module.exports = router;
