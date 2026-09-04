const rateLimit = require('express-rate-limit');

// Standard brute-force protection on authentication endpoints: caps how many
// login/register attempts a single IP can make in a time window. Without this,
// an attacker (or a buggy client retry loop) could try unlimited passwords.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per IP per window, generous enough for real users, tight for brute force
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please wait a few minutes and try again.',
  },
});

module.exports = { authLimiter };
