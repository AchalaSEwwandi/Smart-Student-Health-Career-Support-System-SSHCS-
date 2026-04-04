import express from 'express';
import {
  createDeliveryPerson,
  getDeliveryPersons,
  updateDeliveryPerson,
  deleteDeliveryPerson,
  assignDeliveryPerson,
  getDeliveryTracking,
  markDelivered,
  getDeliveryStats,
  getMyAssignments,
  getMyDashboard
} from '../controllers/deliveryController.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();


// Delivery person management (admin only)
router.post('/persons', createDeliveryPerson);
router.get('/persons',  getDeliveryPersons);
router.put('/persons/:id', updateDeliveryPerson);
router.delete('/persons/:id', deleteDeliveryPerson);

// Vendor assigning delivery
router.post('/assign/:orderId', assignDeliveryPerson);

// Delivery dashboard
router.get('/my-assignments', verifyToken, getMyAssignments);
router.get('/my-dashboard', verifyToken, getMyDashboard);

// Delivery tracking (public to authenticated users)
router.get('/tracking/:orderId', getDeliveryTracking);
router.put('/:orderId/mark-delivered',  markDelivered);

// Stats (admin only)
router.get('/stats',  getDeliveryStats);

export default router;
