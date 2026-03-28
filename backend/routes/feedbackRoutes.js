const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getFeedbackByTarget,
  getTopRated,
  getAdminAnalytics
} = require('../controllers/feedbackController');

const verifyToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// POST /api/feedback (Only Students can give feedback based on requirements)
// Wait, user instructions say: "Student -> submit feedback". I will let everyone in via verifyToken but RBAC could be stricter.
// Let's protect it with student and perhaps other roles if needed, but per requirements: "Student -> submit feedback".
router.post('/', verifyToken, roleCheck('student'), submitFeedback);

// GET /api/feedback/top (Public or authenticated)
router.get('/top', getTopRated);

// GET /api/feedback/admin/analytics (Only Admin)
router.get('/admin/analytics', verifyToken, roleCheck('admin'), getAdminAnalytics);

// GET /api/feedback/:targetId (Protected, internal check allows Shop owner to view their own, Admin views any)
// Optionally we can require a token if we only want users to see it. 
// Let's make it verifyToken so the controller can read req.user.id
// But it can also be public if we just check `if(req.user)` inside. 
// Let's use an optional auth or just protect it. 
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return verifyToken(req, res, next);
};

router.get('/:targetId', optionalAuth, getFeedbackByTarget);

module.exports = router;
