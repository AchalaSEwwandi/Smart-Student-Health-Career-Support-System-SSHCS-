const mongoose = require('mongoose');

/**
 * Feedback schema — students rate delivery_persons and shop_owners.
 * Includes sentiment analysis results computed on submission.
 */
const feedbackSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['delivery_person', 'shop_owner'],
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      minlength: 10,
    },
    sentimentScore: {
      type: Number,
      default: 0,
    },
    sentimentLabel: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
    sentimentEmoji: {
      type: String,
      default: '🟡',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
