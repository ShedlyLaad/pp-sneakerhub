const express = require('express');
const { body } = require('express-validator');
const { register, login, me, updateMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('email').isEmail().normalizeEmail().withMessage('a valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('password must be at least 8 characters'),
  ],
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('a valid email is required'),
    body('password').notEmpty().withMessage('password is required'),
  ],
  login
);

router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateMe);

module.exports = router;
