const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const upload = require('../middleware/upload');

// Doctors
router.get('/doctors', hospitalController.getDoctors);

// Pharmacies
router.get('/pharmacies', hospitalController.getPharmacies);

// Appointments
router.post('/appointments', hospitalController.createAppointment);
router.get('/appointments/student/:id', hospitalController.getStudentAppointments);
router.get('/appointments/doctor/:id', hospitalController.getDoctorAppointments);
router.put('/appointments/:id/approve', hospitalController.approveAppointment);
router.put('/appointments/:id/reject', hospitalController.rejectAppointment);

// Prescriptions — multipart/form-data file upload
router.post('/prescriptions', upload.single('file'), hospitalController.uploadPrescription);
router.get('/prescriptions/student/:id', hospitalController.getStudentPrescriptions);
router.get('/prescriptions/pharmacy/:id', hospitalController.getPharmacyPrescriptions);
router.put('/prescriptions/:id/approve', hospitalController.approvePrescription);
router.put('/prescriptions/:id/reject', hospitalController.rejectPrescription);

// Feedback & Ratings
router.post('/feedback', hospitalController.submitFeedback);
router.get('/feedback/doctor/:doctorId', hospitalController.getDoctorFeedback);

module.exports = router;
