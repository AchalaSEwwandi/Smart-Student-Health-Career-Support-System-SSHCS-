const express = require('express');
const router = express.Router();
const {
  createUser, getAllUsers, getUserById, updateUserStatus, deleteUser,
  getStats, getSentimentAnalytics,
  getAllComplaints, updateComplaint,
  getAllFeedback,
} = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const allowRoles = require('../middleware/roleCheck');

const adminOnly = [verifyToken, allowRoles('admin')];

router.get('/stats', ...adminOnly, getStats);
router.get('/sentiment-analytics', ...adminOnly, getSentimentAnalytics);

router.post('/users', ...adminOnly, createUser);
router.get('/users', ...adminOnly, getAllUsers);
router.get('/users/:id', ...adminOnly, getUserById);
router.put('/users/:id/status', ...adminOnly, updateUserStatus);
router.delete('/users/:id', ...adminOnly, deleteUser);

router.get('/complaints', ...adminOnly, getAllComplaints);
router.put('/complaints/:id', ...adminOnly, updateComplaint);

router.get('/feedback', ...adminOnly, getAllFeedback);

module.exports = router;
