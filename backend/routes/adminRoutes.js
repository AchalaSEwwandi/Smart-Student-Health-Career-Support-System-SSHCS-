const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Contact = require('../models/Contact');
const verifyToken = require('../middleware/auth');
const roleCheck   = require('../middleware/roleCheck');
const { sendApprovalEmail, sendContactReplyEmail } = require('../utils/sendEmail');

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

/**
 * GET /api/admin/contacts
 * Get all contact form submissions, latest first
 */
router.get('/contacts', verifyToken, roleCheck('admin'), async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/contacts/:id/reply
 * Save the admin's reply to the database and send the email
 */
router.patch('/contacts/:id/reply', verifyToken, roleCheck('admin'), async (req, res, next) => {
  try {
    const { replyText } = req.body;
    if (!replyText) return res.status(400).json({ success: false, message: 'Reply text is required.' });

    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found.' });

    if (contact.status === 'replied') {
      return res.status(400).json({ success: false, message: 'Already replied.' });
    }

    contact.status = 'replied';
    contact.replyMessage = replyText;
    contact.repliedAt = new Date();
    await contact.save();

    // Send email to user (non-blocking)
    sendContactReplyEmail({
      to: contact.email,
      name: contact.name,
      messageSubject: contact.subject,
      replyText: contact.replyMessage
    }).catch((err) => console.error('Contact reply email failed:', err.message));

    res.json({ success: true, message: 'Reply sent successfully.', data: contact });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
