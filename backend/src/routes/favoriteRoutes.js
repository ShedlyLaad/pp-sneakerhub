const express = require('express');
const { listFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', listFavorites);
router.post('/:productId', addFavorite);
router.delete('/:productId', removeFavorite);

module.exports = router;
