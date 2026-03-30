const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

// --- Doctors ---
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'name email');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- Appointments ---
exports.createAppointment = async (req, res) => {
    try {
        const { studentId, doctorId, timeSlot } = req.body;
        const appointment = new Appointment({ studentId, doctorId, timeSlot });
        await appointment.save();
        res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getStudentAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ studentId: req.params.id })
            .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' }});
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.params.id })
            .populate('studentId', 'name email');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.approveAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
        res.json({ message: 'Appointment approved', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.rejectAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
        res.json({ message: 'Appointment rejected', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- Prescriptions ---
exports.uploadPrescription = async (req, res) => {
    try {
        const { appointmentId, studentId, pharmacyId, fileUrl } = req.body;
        const prescription = new Prescription({ appointmentId, studentId, pharmacyId, fileUrl });
        await prescription.save();
        res.status(201).json({ message: 'Prescription uploaded successfully', prescription });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getStudentPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ studentId: req.params.id })
            .populate('pharmacyId', 'name email');
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getPharmacyPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ pharmacyId: req.params.id })
             .populate('studentId', 'name email')
             .populate({ path: 'appointmentId', populate: { path: 'doctorId', select: 'specialization' }});
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.approvePrescription = async (req, res) => {
    try {
        const prescription = await Prescription.findByIdAndUpdate(req.params.id, { status: 'accepted' }, { new: true });
        res.json({ message: 'Prescription accepted', prescription });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.rejectPrescription = async (req, res) => {
    try {
        const prescription = await Prescription.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
        res.json({ message: 'Prescription rejected', prescription });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- Feedback ---
exports.submitFeedback = async (req, res) => {
    try {
        const { studentId, doctorId, rating, comment } = req.body;
        const feedback = new Feedback({ studentId, doctorId, rating, comment });
        await feedback.save();
        res.status(201).json({ message: 'Feedback submitted', feedback });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getPharmacies = async (req, res) => {
    try {
        const pharmacies = await User.find({ role: 'pharmacy' }).select('name email _id');
        res.json(pharmacies);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
