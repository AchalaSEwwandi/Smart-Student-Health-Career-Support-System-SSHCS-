const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');

/**
 * GET /api/admin/users
 * Get all users with pagination (10 per page).
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        users,
        pagination: { total, page, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users/:id
 * Get a specific user by ID.
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id/status
 * Activate or deactivate a user.
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Permanently delete a user.
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats
 * Return aggregated overview stats for the admin dashboard.
 */
const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers, totalStudents, totalDoctors,
      totalShopOwners, totalDelivery,
      openComplaints, resolvedComplaints,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'shop_owner' }),
      User.countDocuments({ role: 'delivery_person' }),
      Complaint.countDocuments({ status: { $in: ['pending', 'under_review'] } }),
      Complaint.countDocuments({ status: 'resolved' }),
    ]);

    // Registrations per day this week
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const registrationsRaw = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Complaints by status
    const complaintsByStatus = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Recent activity: last 10 registrations + 10 complaints combined
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt avatar');
    const recentComplaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('submittedBy', 'name')
      .select('subject status category createdAt submittedBy');

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers, totalStudents, totalDoctors,
          totalShopOwners, totalDelivery,
          openComplaints, resolvedComplaints,
        },
        registrationsPerDay: registrationsRaw,
        complaintsByStatus,
        recentUsers,
        recentComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/sentiment-analytics
 * Return sentiment breakdown, trends, top/underperformers.
 */
const getSentimentAnalytics = async (req, res, next) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    const positiveCount = await Feedback.countDocuments({ sentimentLabel: 'positive' });
    const neutralCount = await Feedback.countDocuments({ sentimentLabel: 'neutral' });
    const negativeCount = await Feedback.countDocuments({ sentimentLabel: 'negative' });

    // Trend over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const sentimentTrend = await Feedback.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            label: '$sentimentLabel',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Sentiment by target type
    const sentimentByType = await Feedback.aggregate([
      {
        $group: {
          _id: { targetType: '$targetType', label: '$sentimentLabel' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Top performers (delivery_person + shop_owner sorted by performanceScore desc)
    const topPerformers = await User.find({
      role: { $in: ['delivery_person', 'shop_owner'] },
      isActive: true,
    })
      .sort({ performanceScore: -1 })
      .limit(10)
      .select('name avatar role performanceScore');

    // Add avg rating to each performer
    const topWithStats = await Promise.all(
      topPerformers.map(async (u) => {
        const feedbacks = await Feedback.find({ toUser: u._id });
        const avgRating = feedbacks.length
          ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
          : 0;
        const sentiment = feedbacks.length
          ? feedbacks.filter((f) => f.sentimentLabel === 'positive').length > feedbacks.length / 2
            ? 'positive'
            : feedbacks.filter((f) => f.sentimentLabel === 'negative').length > feedbacks.length / 2
            ? 'negative'
            : 'neutral'
          : 'neutral';
        return { ...u.toObject(), avgRating, totalReviews: feedbacks.length, sentiment };
      })
    );

    // Underperformers
    const underperformers = await User.find({
      role: { $in: ['delivery_person', 'shop_owner'] },
      isActive: true,
      performanceScore: { $lt: 50 },
    })
      .sort({ performanceScore: 1 })
      .limit(10)
      .select('name avatar role performanceScore');

    const underWithStats = await Promise.all(
      underperformers.map(async (u) => {
        const feedbacks = await Feedback.find({ toUser: u._id });
        const avgRating = feedbacks.length
          ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
          : 0;
        return { ...u.toObject(), avgRating, totalReviews: feedbacks.length };
      })
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalFeedback,
          positivePercent: totalFeedback ? Math.round((positiveCount / totalFeedback) * 100) : 0,
          neutralPercent: totalFeedback ? Math.round((neutralCount / totalFeedback) * 100) : 0,
          negativePercent: totalFeedback ? Math.round((negativeCount / totalFeedback) * 100) : 0,
        },
        sentimentTrend,
        sentimentByType,
        topPerformers: topWithStats,
        underperformers: underWithStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/complaints
 * Get all complaints with pagination and filters.
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.priority) filter.priority = req.query.priority;

    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate('submittedBy', 'name email avatar')
      .populate('againstUser', 'name email role')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        complaints,
        pagination: { total, page, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/complaints/:id
 * Update complaint status and admin note.
 */
const updateComplaint = async (req, res, next) => {
  try {
    const { status, adminNote, priority } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    if (priority) updateData.priority = priority;
    if (status === 'resolved' || status === 'dismissed') updateData.resolvedAt = new Date();

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('submittedBy', 'name email')
      .populate('againstUser', 'name email role');

    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

    res.json({ success: true, message: 'Complaint updated.', data: { complaint } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/feedback
 * Get all feedback (admin only).
 */
const getAllFeedback = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const total = await Feedback.countDocuments();
    const feedbacks = await Feedback.find()
      .populate('fromUser', 'name avatar')
      .populate('toUser', 'name avatar role')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { feedbacks, pagination: { total, page, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers, getUserById, updateUserStatus, deleteUser,
  getStats, getSentimentAnalytics,
  getAllComplaints, updateComplaint,
  getAllFeedback,
};
