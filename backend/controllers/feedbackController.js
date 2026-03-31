const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const Appointment = require('../models/Appointment');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// @desc    Submit feedback (for order or appointment)
// @route   POST /api/feedback
// @access  Private (Student)
exports.submitFeedback = async (req, res, next) => {
  try {
    const { orderId, shopId, shopRating, shopComment, driverId, driverRating, driverComment, appointmentId, doctorId, doctorRating, doctorComment } = req.body;
    const userId = req.user.id; // from JWT middleware

    // 1. Check Appointment Feedback
    if (appointmentId) {
      if (!doctorId || !doctorRating || !doctorComment) {
        return res.status(400).json({ success: false, message: 'Please provide doctorId, doctorRating, and doctorComment.' });
      }

      // Check if appointment is completed
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
      if (appointment.status !== 'Completed') {
        return res.status(400).json({ success: false, message: 'Feedback allowed ONLY when appointment is Completed.' });
      }

      // Check duplicates
      const existing = await Feedback.findOne({ userId, appointmentId, targetType: 'doctor' });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Feedback already submitted for this appointment.' });
      }

      // Sentiment analysis
      const result = sentiment.analyze(doctorComment);
      let sentimentStr = 'neutral';
      if (result.score > 0) sentimentStr = 'positive';
      else if (result.score < 0) sentimentStr = 'negative';

      const feedback = await Feedback.create({
        userId,
        targetType: 'doctor',
        targetId: doctorId,
        appointmentId,
        rating: doctorRating,
        comment: doctorComment,
        sentiment: sentimentStr
      });

      return res.status(201).json({ success: true, message: 'Doctor feedback submitted successfully!', data: feedback });
    }

    // 2. Check Order Feedback
    if (orderId) {
      if (!shopId && !driverId) {
        return res.status(400).json({ success: false, message: 'Please provide shop or driver details for the order.' });
      }

      // Check if order is delivered
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
      if (order.status !== 'Delivered') {
        return res.status(400).json({ success: false, message: 'Feedback allowed ONLY when order is Delivered.' });
      }

      const createdFeedback = [];

      // Process Shop Feedback
      if (shopId && shopRating && shopComment) {
        const existingShop = await Feedback.findOne({ userId, orderId, targetType: 'shop' });
        if (existingShop) {
          return res.status(400).json({ success: false, message: 'Feedback already submitted for the shop for this order.' });
        }
        
        const result = sentiment.analyze(shopComment);
        let sentimentStr = 'neutral';
        if (result.score > 0) sentimentStr = 'positive';
        else if (result.score < 0) sentimentStr = 'negative';

        const shopFeedback = await Feedback.create({
          userId, targetType: 'shop', targetId: shopId, orderId,
          rating: shopRating, comment: shopComment, sentiment: sentimentStr
        });
        createdFeedback.push(shopFeedback);
      }

      // Process Driver Feedback
      if (driverId && driverRating && driverComment) {
        const existingDriver = await Feedback.findOne({ userId, orderId, targetType: 'driver' });
        if (existingDriver) {
          return res.status(400).json({ success: false, message: 'Feedback already submitted for the driver for this order.' });
        }
        
        const result = sentiment.analyze(driverComment);
        let sentimentStr = 'neutral';
        if (result.score > 0) sentimentStr = 'positive';
        else if (result.score < 0) sentimentStr = 'negative';

        const driverFeedback = await Feedback.create({
          userId, targetType: 'driver', targetId: driverId, orderId,
          rating: driverRating, comment: driverComment, sentiment: sentimentStr
        });
        createdFeedback.push(driverFeedback);
      }

      if (createdFeedback.length === 0) {
        return res.status(400).json({ success: false, message: 'Missing rating/comment for shop or driver.' });
      }

      return res.status(201).json({ success: true, message: 'Order feedback submitted successfully!', data: createdFeedback });
    }

    return res.status(400).json({ success: false, message: 'Either orderId or appointmentId is required.' });
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key
       return res.status(400).json({ success: false, message: 'Duplicate feedback rejected.' });
    }
    next(error);
  }
};

// @desc    Get all feedback for a specific target
// @route   GET /api/feedback/:targetId
// @access  Public / Protected based on requirement (Here shop owners only view their own)
exports.getFeedbackByTarget = async (req, res, next) => {
  try {
    const { targetId } = req.params;
    
    // RBAC: If requester is shop_owner, ensure they only query their own ID
    // (Assuming req.user is set. For admin or student, no restriction)
    if (req.user && req.user.role === 'shop_owner' && req.user.id !== targetId) {
       return res.status(403).json({ success: false, message: 'You can only view your own feedback.' });
    }

    const feedbacks = await Feedback.find({ targetId })
                                    .populate('userId', 'name')
                                    .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top-rated entities (doctors, shops, drivers)
// @route   GET /api/feedback/top
// @access  Public
exports.getTopRated = async (req, res, next) => {
  try {
    // Score = averageRating + (reviewCount weight). For simplicity, let weight be 0.1 per review (up to max, e.g. 5)
    // We will aggregate.
    const topRated = await Feedback.aggregate([
      {
        $group: {
          _id: { targetId: '$targetId', targetType: '$targetType' },
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      },
      {
        $addFields: {
          score: { $add: ['$averageRating', { $multiply: ['$reviewCount', 0.1] }] }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 15 },
      {
        $lookup: {
          from: 'users',
          localField: '_id.targetId',
          foreignField: '_id',
          as: 'targetDetails'
        }
      },
      { $unwind: '$targetDetails' },
      {
        $project: {
          _id: 0,
          targetId: '$_id.targetId',
          targetType: '$_id.targetType',
          averageRating: 1,
          reviewCount: 1,
          score: 1,
          name: '$targetDetails.name',
          shopName: '$targetDetails.shopName'
        }
      }
    ]);

    // Grouping into types
    const result = {
      doctors: topRated.filter(item => item.targetType === 'doctor'),
      shops: topRated.filter(item => item.targetType === 'shop'),
      drivers: topRated.filter(item => item.targetType === 'driver')
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback analytics for Admin dashboard
// @route   GET /api/feedback/admin/analytics
// @access  Private (Admin)
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    // Total count
    const totalCount = await Feedback.countDocuments();

    // Average Rating overall
    const avgObj = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const averageRating = avgObj.length > 0 ? avgObj[0].avgRating : 0;

    // Sentiment distribution
    const sentiments = await Feedback.aggregate([
      { $group: { _id: '$sentiment', count: { $sum: 1 } } }
    ]);

    // Ratings grouped by type
    const byType = await Feedback.aggregate([
      { $group: { _id: '$targetType', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalFeedback: totalCount,
        averageRating,
        sentimentDistribution: sentiments,
        byType
      }
    });

  } catch (error) {
    next(error);
  }
};
// @desc    Get my own feedback analytics (for vendor dashboard)
// @route   GET /api/feedback/my/analytics
// @access  Private (doctor, shop_owner, delivery_person)
exports.getMyAnalytics = async (req, res, next) => {
  try {
    const targetId = req.user.id;

    const totalCount = await Feedback.countDocuments({ targetId });

    const avgObj = await Feedback.aggregate([
      { $match: { targetId: require('mongoose').Types.ObjectId.createFromHexString(targetId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const averageRating = avgObj.length > 0 ? avgObj[0].avgRating : 0;

    const sentiments = await Feedback.aggregate([
      { $match: { targetId: require('mongoose').Types.ObjectId.createFromHexString(targetId) } },
      { $group: { _id: '$sentiment', count: { $sum: 1 } } }
    ]);

    const ratingDist = await Feedback.aggregate([
      { $match: { targetId: require('mongoose').Types.ObjectId.createFromHexString(targetId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const recent = await Feedback.find({ targetId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('rating comment sentiment createdAt userId');

    res.status(200).json({
      success: true,
      data: {
        totalFeedback: totalCount,
        averageRating,
        sentimentDistribution: sentiments,
        ratingDistribution: ratingDist,
        recentComments: recent
      }
    });
  } catch (error) {
    next(error);
  }
};
