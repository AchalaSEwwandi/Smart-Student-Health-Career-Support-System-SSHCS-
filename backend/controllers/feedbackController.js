const Feedback = require('../models/Feedback');
const User = require('../models/User');
const analyzeSentiment = require('../utils/sentimentAnalyzer');

/**
 * Recalculate and save performanceScore for a user after each feedback submission.
 * Formula:
 *   avgRating           = average of all ratings
 *   avgSentimentScore   = average of all sentimentScore values
 *   normalizedSentiment = ((avgSentimentScore + 1) / 2) * 100
 *   performanceScore    = (avgRating / 5 * 70) + (normalizedSentiment * 30)
 * @param {string} userId
 */
const recalculatePerformanceScore = async (userId) => {
  const feedbacks = await Feedback.find({ toUser: userId });
  if (feedbacks.length === 0) return;

  const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
  const avgSentimentScore = feedbacks.reduce((sum, f) => sum + f.sentimentScore, 0) / feedbacks.length;
  const normalizedSentiment = ((avgSentimentScore + 1) / 2) * 100;
  const performanceScore = (avgRating / 5) * 70 + normalizedSentiment * 0.3;

  await User.findByIdAndUpdate(userId, { performanceScore: Math.round(performanceScore * 100) / 100 });
};

/**
 * POST /api/feedback
 * Submit feedback with sentiment analysis and trigger performance score recalculation.
 */
const submitFeedback = async (req, res, next) => {
  try {
    const { toUser, targetType, orderId, rating, comment } = req.body;

    const { score, label, emoji } = analyzeSentiment(comment);

    const feedback = await Feedback.create({
      fromUser: req.user.id,
      toUser,
      targetType,
      orderId: orderId || undefined,
      rating,
      comment,
      sentimentScore: score,
      sentimentLabel: label,
      sentimentEmoji: emoji,
    });

    await recalculatePerformanceScore(toUser);

    const populated = await feedback.populate('fromUser', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      data: { feedback: populated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/feedback/received/:userId
 * Get all feedback received by a user.
 */
const getReceivedFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ toUser: req.params.userId })
      .populate('fromUser', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { feedbacks } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/feedback/given/:userId
 * Get all feedback given by a student.
 */
const getGivenFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ fromUser: req.params.userId })
      .populate('toUser', 'name avatar role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { feedbacks } });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitFeedback, getReceivedFeedback, getGivenFeedback };
