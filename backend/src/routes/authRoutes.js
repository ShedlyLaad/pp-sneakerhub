const express = require('express');
const { body } = require('express-validator');
const { register, login, me, updateMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('email').isEmail().withMessage('a valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('a valid email is required'),
    body('password').notEmpty().withMessage('password is required'),
  ],
  login
);

router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateMe);

module.exports = router;
