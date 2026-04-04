<<<<<<< HEAD
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    storeName: {
      type: String,
      required: true,
      index: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Product', productSchema);
=======
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    unit:        { type: String, default: '' },          // e.g. "1kg", "500ml", "Pack"
    description: { type: String, default: '' },
    category:    { type: String, default: 'General' },
    price:       { type: Number, required: true, min: 0 },
    stock:       { type: Number, default: 0, min: 0 },
    image:       { type: String, default: '' },          // base64 data-URL or URL string
    isAvailable: { type: Boolean, default: true },
    // storeName matches the resolved name used across the admin system
    // e.g. 'Cargils' | 'Abenayaka Stores' | 'Dewnini Stores'
    storeName:   { type: String, required: true, index: true },
    // keep ObjectId ref for backward compatibility
    shop:        { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
