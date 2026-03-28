const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
