const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientName:     { type: String, required: true },
  symptoms:        { type: String, required: true },
  date:            { type: String, required: true },
  timeSlot:        { type: String, required: true },
  additionalNotes: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
