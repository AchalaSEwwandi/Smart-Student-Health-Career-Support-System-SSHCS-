const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for auth routes.
 * Max 100 requests per minute in dev, 15 in production.
 */
const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 15 : 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 1 minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = rateLimiter;
