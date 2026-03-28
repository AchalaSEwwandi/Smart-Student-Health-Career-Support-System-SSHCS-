const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const verifyToken = require('../middleware/auth');
const roleCheck   = require('../middleware/roleCheck');
const { sendApprovalEmail } = require('../utils/sendEmail');

/**
 * GET /api/admin/users
 * List users – optionally filter by role and/or status
 */
router.get('/users', verifyToken, roleCheck('admin'), async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const filter = {};
    if (role)   filter.role   = role;
    if (status) filter.status = status;

    const users = await User.find(filter).select('-password -refreshToken').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/users/:id/approve
 * Approve a pending doctor or vendor account.
 * Sends approval email on success.
 */
router.patch('/users/:id/approve', verifyToken, roleCheck('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.status === 'approved') {
      return res.status(400).json({ success: false, message: 'User is already approved.' });
    }

    user.status = 'approved';
    await user.save({ validateBeforeSave: false });

    // Send approval email (non-blocking)
    sendApprovalEmail({ to: user.email, name: user.name }).catch((err) =>
      console.error('Approval email failed:', err.message)
    );

    res.json({
      success: true,
      message: `${user.name}'s account has been approved. Notification email sent.`,
      data: { id: user._id, status: user.status },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/users/:id/reject
 * Reject (soft-delete / deactivate) a pending account.
 */
router.patch('/users/:id/reject', verifyToken, roleCheck('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, message: `${user.name}'s account has been rejected.` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
