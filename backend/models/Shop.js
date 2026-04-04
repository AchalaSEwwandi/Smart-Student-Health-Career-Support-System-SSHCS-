<<<<<<< HEAD
import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    businessType: {
      type: String,
      enum: ['pharmacy', 'grocery', 'other'],
    },
    address: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    contactPhone: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Shop', shopSchema);
=======
const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  location: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Shop', shopSchema);
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
