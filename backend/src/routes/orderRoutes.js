const express = require('express');
const { createOrder, listMyOrders, getOrder } = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.post('/', createOrder);
router.get('/', listMyOrders);
router.get('/:id', getOrder);

module.exports = router;
