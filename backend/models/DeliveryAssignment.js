<<<<<<< HEAD
import mongoose from 'mongoose';

const deliveryAssignmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    deliveryPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryPerson',
      required: false,
    },
    deliveryPersonName: {
      type: String,
      default: '',
    },
    deliveryPersonPhone: {
      type: String,
      default: '',
    },
    vehicleType: {
      type: String,
      default: '',
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('DeliveryAssignment', deliveryAssignmentSchema);
=======
const mongoose = require('mongoose');

const deliveryAssignmentSchema = new mongoose.Schema({
  order:              { type: mongoose.Schema.Types.ObjectId, ref: 'Order',          required: true },
  deliveryPerson:     { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPerson', required: false },
  deliveryPersonName: { type: String, default: '' },
  deliveryPersonPhone:{ type: String, default: '' },
  vehicleType:        { type: String, default: '' },
  vehicleNumber:      { type: String, default: '' },
  assignedAt:         { type: Date, default: Date.now },
  isAvailable:        { type: Boolean, default: false },
});

module.exports = mongoose.model('DeliveryAssignment', deliveryAssignmentSchema);
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
