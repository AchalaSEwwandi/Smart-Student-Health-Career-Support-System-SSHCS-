const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization:  { type: String, required: true },
  consultationFee: { type: Number, required: true },
  rating:          { type: Number, default: 0 },
  reviewCount:     { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
