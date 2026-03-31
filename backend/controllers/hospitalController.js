const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const path = require('path');

// ─── Doctors ──────────────────────────────────────────────────────────────────
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'name email');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Appointments ─────────────────────────────────────────────────────────────
exports.createAppointment = async (req, res) => {
  try {
    const { studentId, doctorId, patientName, symptoms, date, timeSlot, additionalNotes } = req.body;

    // Validations
    if (!patientName || !symptoms || !date || !timeSlot) {
      return res.status(400).json({ message: 'Patient name, symptoms, date, and time slot are required.' });
    }
    const lettersOnly = /^[A-Za-z\s]+$/;
    if (!lettersOnly.test(patientName)) {
      return res.status(400).json({ message: 'Patient name must contain letters only.' });
    }

    const appointment = new Appointment({
      studentId,
      doctorId,
      patientName: patientName.trim(),
      symptoms: symptoms.trim(),
      date,
      timeSlot,
      additionalNotes: additionalNotes?.trim() || ''
    });
    await appointment.save();
    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStudentAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ studentId: req.params.id })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } })
      .sort({ createdAt: -1 });

    // Attach feedback info to each appointment
    const withFeedback = await Promise.all(appointments.map(async (app) => {
      const fb = await Feedback.findOne({ appointmentId: app._id });
      return { ...app.toObject(), feedback: fb || null };
    }));

    res.json(withFeedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.id })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    // Attach feedback to each appointment
    const withFeedback = await Promise.all(appointments.map(async (app) => {
      const fb = await Feedback.findOne({ appointmentId: app._id });
      return { ...app.toObject(), feedback: fb || null };
    }));

    res.json(withFeedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { status: 'approved' }, { new: true }
    );
    res.json({ message: 'Appointment approved', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.rejectAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { status: 'rejected' }, { new: true }
    );
    res.json({ message: 'Appointment rejected', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Prescriptions ────────────────────────────────────────────────────────────
exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please provide a PDF or image file.' });
    }

    const { appointmentId, studentId, pharmacyId } = req.body;
    if (!appointmentId || !studentId || !pharmacyId) {
      return res.status(400).json({ message: 'Appointment, student, and pharmacy are required.' });
    }

    // Check if prescription already uploaded for this appointment
    const existing = await Prescription.findOne({ appointmentId });
    if (existing) {
      return res.status(400).json({ message: 'Prescription already uploaded for this appointment.' });
    }

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

    const prescription = new Prescription({ appointmentId, studentId, pharmacyId, fileUrl, fileType });
    await prescription.save();

    res.status(201).json({ message: 'Prescription uploaded successfully', prescription });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStudentPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ studentId: req.params.id })
      .populate('pharmacyId', 'name email')
      .populate({ path: 'appointmentId', populate: { path: 'doctorId', populate: { path: 'userId', select: 'name' } } })
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPharmacyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ pharmacyId: req.params.id })
      .populate('studentId', 'name email')
      .populate({ path: 'appointmentId', populate: { path: 'doctorId', populate: { path: 'userId', select: 'name' } } })
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.approvePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id, { status: 'accepted' }, { new: true }
    );
    res.json({ message: 'Prescription accepted', prescription });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.rejectPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id, { status: 'rejected' }, { new: true }
    );
    res.json({ message: 'Prescription rejected', prescription });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Feedback & Ratings ───────────────────────────────────────────────────────
exports.submitFeedback = async (req, res) => {
  try {
    const { appointmentId, studentId, doctorId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    // Prevent duplicate feedback for the same appointment
    const existing = await Feedback.findOne({ appointmentId });
    if (existing) {
      return res.status(400).json({ message: 'Feedback already submitted for this appointment.' });
    }

    const feedback = new Feedback({ appointmentId, studentId, doctorId, rating, comment });
    await feedback.save();

    // Recalculate doctor average rating
    const allFeedback = await Feedback.find({ doctorId });
    const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
    await Doctor.findByIdAndUpdate(doctorId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: allFeedback.length
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDoctorFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ doctorId: req.params.doctorId })
      .populate('studentId', 'name')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Pharmacies ───────────────────────────────────────────────────────────────
exports.getPharmacies = async (req, res) => {
  try {
    const pharmacies = await User.find({ role: 'pharmacy' }).select('name email _id');
    res.json(pharmacies);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
