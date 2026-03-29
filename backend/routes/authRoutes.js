const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  register, login, logout, refreshToken,
  forgotPassword, verifyOTP, resetPassword,
} = require('../controllers/authController');
const rateLimiter   = require('../middleware/rateLimiter');
const validate      = require('../middleware/validate');
const verifyToken   = require('../middleware/auth');
const upload        = require('../middleware/upload');

// ── Validation rules ──────────────────────────────────────────────────────────
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // role is optional; defaults to 'student' in controller
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Routes ────────────────────────────────────────────────────────────────────

// Register — multipart/form-data so files can be attached
router.post(
  '/register',
  rateLimiter,
  upload.fields([
    { name: 'medicalLicenseFile', maxCount: 1 },
    { name: 'businessLicenseFile', maxCount: 1 },
  ]),
  registerValidation,
  validate,
  register
);

router.post('/login',          rateLimiter, loginValidation, validate, login);
router.post('/logout',         verifyToken, logout);
router.post('/refresh-token',  refreshToken);
router.post('/forgot-password', rateLimiter, [body('email').isEmail()], validate, forgotPassword);
router.post('/verify-otp',     rateLimiter, verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
