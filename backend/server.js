require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ✅ Only auth routes
const authRoutes = require('./routes/authRoutes');

const app = express();

// ── Middleware ─────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ────────────────────────────────
app.use('/api/auth', authRoutes);

// Example:
// /api/auth/login
// /api/auth/register
// /api/auth/forgot-password

// ── Error Handler ─────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
});