const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  category: { type: String, default: 'General' },
  stock: { type: Number, default: 100 },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model('Product', productSchema);
