const express = require('express');
const router = express.Router();
const { submitFeedback, getReceivedFeedback, getGivenFeedback } = require('../controllers/feedbackController');
const verifyToken = require('../middleware/auth');
const allowRoles = require('../middleware/roleCheck');

router.post('/', verifyToken, allowRoles('student'), submitFeedback);
router.get('/received/:userId', verifyToken, getReceivedFeedback);
router.get('/given/:userId', verifyToken, getGivenFeedback);

module.exports = router;
