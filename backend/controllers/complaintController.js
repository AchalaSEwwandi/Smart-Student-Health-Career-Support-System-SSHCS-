const Complaint = require('../models/Complaint');

/**
 * POST /api/complaints
 * Submit a complaint (student only).
 */
const submitComplaint = async (req, res, next) => {
  try {
    const { againstUser, againstRole, subject, description, category, priority } = req.body;

    const complaint = await Complaint.create({
      submittedBy: req.user.id,
      againstUser,
      againstRole,
      subject,
      description,
      category,
      priority: priority || 'medium',
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: { complaint },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/complaints/my
 * Get own complaints with their current status.
 */
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ submittedBy: req.user.id })
      .populate('againstUser', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { complaints } });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitComplaint, getMyComplaints };
