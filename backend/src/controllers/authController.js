const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Cart = require('../models/Cart');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');

function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array().map((e) => e.msg).join(', '));
  }
}

const register = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  await Cart.create({ user: user._id, items: [] });

  const token = signToken(user);
  res.status(201).json({ success: true, data: { token, user: user.toSafeJSON() } });
});

const login = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const match = await user.comparePassword(password);
  if (!match) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(user);
  res.json({ success: true, data: { token, user: user.toSafeJSON() } });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, address } = req.body;
  if (name !== undefined) req.user.name = name;
  if (address !== undefined) req.user.address = { ...req.user.address, ...address };
  await req.user.save();
  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
});

module.exports = { register, login, me, updateMe };
