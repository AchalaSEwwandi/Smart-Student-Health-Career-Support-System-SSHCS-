const express = require('express');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const {
  createMessage,
  getMyMessages,
  getReceivedMessages,
  replyToMessage,
} = require('../controllers/messageController');

const router = express.Router();

// Only students can create messages and view their sent messages
router.post('/', protect, authorize('student'), createMessage);
router.get('/my', protect, authorize('student'), getMyMessages);

// Only doctors and shop_owners can view received messages and reply
router.get('/received', protect, authorize('doctor', 'shop_owner'), getReceivedMessages);
router.put('/:id/reply', protect, authorize('doctor', 'shop_owner'), replyToMessage);

module.exports = router;
