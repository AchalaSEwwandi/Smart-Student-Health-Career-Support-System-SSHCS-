const express = require('express');
const router = express.Router();
const { submitComplaint, getMyComplaints } = require('../controllers/complaintController');
const verifyToken = require('../middleware/auth');
const allowRoles = require('../middleware/roleCheck');

router.post('/', verifyToken, allowRoles('student'), submitComplaint);
router.get('/my', verifyToken, getMyComplaints);

module.exports = router;
