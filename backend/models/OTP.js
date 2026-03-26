const mongoose = require('mongoose');

/**
 * OTP schema for forgot-password flow.
 * Uses a TTL index to auto-delete documents after expiry.
 */
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index — document removed when expiresAt is reached
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('OTP', otpSchema);
