const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  inquiry_type: {
    type: String,
    enum: ['general', 'shop_request'],
    required: [true, 'Please specify the inquiry type']
  },
  message: {
    type: String,
    required: [true, 'Please add a message']
  },
  shop_name: {
    type: String
  },
  shop_type: {
    type: String,
    enum: ['Pharmacy', 'Grocery']
  },
  address: {
    type: String
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ContactRequest', contactRequestSchema);
