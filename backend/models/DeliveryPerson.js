const mongoose = require('mongoose');

const deliveryPersonSchema = new mongoose.Schema(
  {
    storeName:     { type: String, required: true, trim: true },  // e.g. "Cargils"
    fullName:      { type: String, required: true, trim: true },
    phone:         { type: String, required: true, trim: true },
    nic:           { type: String, required: true, trim: true },
    vehicleType:   { type: String, required: true, trim: true },
    vehicleNumber: { type: String, required: true, trim: true },
    deliveryArea:  { type: String, required: true, trim: true },
    availability:  { type: String, enum: ['Available', 'Busy'], default: 'Available' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliveryPerson', deliveryPersonSchema);
