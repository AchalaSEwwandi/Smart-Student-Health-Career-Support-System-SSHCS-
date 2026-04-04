<<<<<<< HEAD
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    cardType: {
      type: String,
      enum: ['Visa', 'MasterCard'],
      required: true,
    },
    nameOnCard: {
      type: String,
      required: true,
    },
    lastFourDigits: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Success', 'Failed'],
      default: 'Success',
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Payment', paymentSchema);
=======
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  cardType: { type: String, enum: ['Visa', 'MasterCard'], required: true },
  nameOnCard: { type: String, required: true },
  lastFourDigits: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Success' },
  paidAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
