const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');

router.get('/doctors', hospitalController.getDoctors);
router.get('/pharmacies', hospitalController.getPharmacies);

router.post('/appointments', hospitalController.createAppointment);
router.get('/appointments/student/:id', hospitalController.getStudentAppointments);
router.get('/appointments/doctor/:id', hospitalController.getDoctorAppointments);
router.put('/appointments/:id/approve', hospitalController.approveAppointment);
router.put('/appointments/:id/reject', hospitalController.rejectAppointment);

router.post('/prescriptions', hospitalController.uploadPrescription);
router.get('/prescriptions/student/:id', hospitalController.getStudentPrescriptions);
router.get('/prescriptions/pharmacy/:id', hospitalController.getPharmacyPrescriptions);
router.put('/prescriptions/:id/approve', hospitalController.approvePrescription);
router.put('/prescriptions/:id/reject', hospitalController.rejectPrescription);

router.post('/feedback', hospitalController.submitFeedback);

module.exports = router;
