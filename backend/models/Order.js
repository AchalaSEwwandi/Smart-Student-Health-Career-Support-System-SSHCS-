<<<<<<< HEAD
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      default: 'demo',
    },
    shopName: {
      type: String,
      default: '',
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: false,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: false,
        },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryCharge: {
      type: Number,
      default: 50,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Ready', 'Ready for Pickup', 'Out for Delivery', 'Delivered'],
      default: 'Pending',
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    deliveryArea: {
      type: String,
      enum: ['Inside Campus', 'Outside Campus (around 1km)', ''],
      default: '',
    },
    telephone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    confirmedOrder: {
      type: Boolean,
      default: false,
    },
    isRated: {
      type: Boolean,
      default: false,
    },
    isDeliveryConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Order', orderSchema);

=======
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // student stored as a plain string session key (no auth required)
  studentId: { type: String, default: 'demo' },
  // shop stored as plain string name (no ObjectId required)
  shopName: { type: String, default: '' },
  // keep optional ObjectId ref for future auth integration
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: false },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 50 },
  grandTotal: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Out for Delivery', 'Delivered'],
    default: 'Pending',
  },
  deliveryAddress: { type: String, default: '' },
  deliveryArea: { type: String, enum: ['Inside Campus', 'Outside Campus (around 1km)', ''], default: '' },
  telephone: { type: String, default: '' },
  email: { type: String, default: '' },
  confirmedOrder: { type: Boolean, default: false },
  isRated: { type: Boolean, default: false },
  isDeliveryConfirmed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
