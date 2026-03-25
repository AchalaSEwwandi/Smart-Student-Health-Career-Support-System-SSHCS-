const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  location: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Shop', shopSchema);
