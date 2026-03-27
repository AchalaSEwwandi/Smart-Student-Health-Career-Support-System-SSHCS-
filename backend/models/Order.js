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
