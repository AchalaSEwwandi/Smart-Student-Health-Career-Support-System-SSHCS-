const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  studentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  rating:        { type: Number, required: true, min: 1, max: 5 },
  comment:       { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
