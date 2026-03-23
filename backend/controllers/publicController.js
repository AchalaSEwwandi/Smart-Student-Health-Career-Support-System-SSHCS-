const User = require('../models/User');
const Feedback = require('../models/Feedback');

/**
 * Aggregate helper to compute avg rating and total ratings for a user.
 * @param {string} userId
 */
const getAggregatedStats = async (userId) => {
  const feedbacks = await Feedback.find({ toUser: userId });
  const totalRatings = feedbacks.length;
  const avgRating = totalRatings
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / totalRatings).toFixed(1)
    : 0;
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  feedbacks.forEach((f) => sentimentCounts[f.sentimentLabel]++);
  const dominantSentiment =
    sentimentCounts.positive >= sentimentCounts.neutral &&
    sentimentCounts.positive >= sentimentCounts.negative
      ? 'positive'
      : sentimentCounts.negative > sentimentCounts.neutral
      ? 'negative'
      : 'neutral';

  return { totalRatings, avgRating: parseFloat(avgRating), sentimentLabel: dominantSentiment };
};

/**
 * GET /api/public/top-delivery-persons
 * Top 10 delivery persons sorted by performanceScore (min 3 ratings, active only).
 */
const getTopDeliveryPersons = async (req, res, next) => {
  try {
    const persons = await User.find({ role: 'delivery_person', isActive: true }).select(
      'name avatar vehicleType performanceScore'
    );

    const withStats = await Promise.all(
      persons.map(async (u) => {
        const stats = await getAggregatedStats(u._id);
        return { ...u.toObject(), ...stats };
      })
    );

    const qualified = withStats
      .filter((u) => u.totalRatings >= 3)
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 10);

    res.json({ success: true, data: { deliveryPersons: qualified } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/top-shops
 * Top 10 shops sorted by performanceScore (min 3 ratings, active only).
 */
const getTopShops = async (req, res, next) => {
  try {
    const shops = await User.find({ role: 'shop_owner', isActive: true }).select(
      'name avatar shopName shopType shopAddress performanceScore'
    );

    const withStats = await Promise.all(
      shops.map(async (u) => {
        const stats = await getAggregatedStats(u._id);
        return { ...u.toObject(), ...stats };
      })
    );

    const qualified = withStats
      .filter((u) => u.totalRatings >= 3)
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 10);

    res.json({ success: true, data: { shops: qualified } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/top-rated-all
 * Returns top delivery persons + top shops in a single call (no auth required).
 */
const getTopRatedAll = async (req, res, next) => {
  try {
    const [deliveryPersons, shops] = await Promise.all([
      (async () => {
        const persons = await User.find({ role: 'delivery_person', isActive: true }).select(
          'name avatar vehicleType performanceScore'
        );
        const withStats = await Promise.all(persons.map(async (u) => ({ ...u.toObject(), ...(await getAggregatedStats(u._id)) })));
        return withStats.filter((u) => u.totalRatings >= 3).sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 10);
      })(),
      (async () => {
        const shopList = await User.find({ role: 'shop_owner', isActive: true }).select(
          'name avatar shopName shopType shopAddress performanceScore'
        );
        const withStats = await Promise.all(shopList.map(async (u) => ({ ...u.toObject(), ...(await getAggregatedStats(u._id)) })));
        return withStats.filter((u) => u.totalRatings >= 3).sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 10);
      })(),
    ]);

    res.json({ success: true, data: { deliveryPersons, shops } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/profile/:id
 * Public profile with feedback stats.
 */
const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const feedbacks = await Feedback.find({ toUser: req.params.id })
      .populate('fromUser', 'name avatar')
      .sort({ createdAt: -1 });

    const stats = await getAggregatedStats(req.params.id);

    // Rating breakdown (1-5)
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach((f) => breakdown[f.rating]++);

    // Sentiment counts
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    feedbacks.forEach((f) => sentimentCounts[f.sentimentLabel]++);

    res.json({
      success: true,
      data: { user, feedbacks, stats, ratingBreakdown: breakdown, sentimentCounts },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTopDeliveryPersons, getTopShops, getTopRatedAll, getPublicProfile };
