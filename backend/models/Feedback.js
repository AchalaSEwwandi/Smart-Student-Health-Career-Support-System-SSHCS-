const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['shop', 'driver', 'doctor'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Either orderId or appointmentId is required depending on targetType
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: 'Order' // assuming order collection might exist later
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: 'Appointment' // assuming appointment collection might exist later
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      required: true,
    },
  },
  { timestamps: true }
);

// We need to enforce unique feedback per order/appointment per user.
// A user shouldn't submit feedback twice for the same order (targetting the same actor).
// So userId + orderId + targetType is unique, or just userId + orderId per targetType
feedbackSchema.index({ userId: 1, orderId: 1, targetType: 1 }, { unique: true, partialFilterExpression: { orderId: { $exists: true } } });
feedbackSchema.index({ userId: 1, appointmentId: 1, targetType: 1 }, { unique: true, partialFilterExpression: { appointmentId: { $exists: true } } });

module.exports = mongoose.model('Feedback', feedbackSchema);
