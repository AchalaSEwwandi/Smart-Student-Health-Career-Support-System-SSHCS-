<<<<<<< HEAD
import express from 'express';
import {
  getUsers,
  approveUser,
  rejectUser,
  getContacts,
  replyContact,
} from '../controllers/adminController.js';
import verifyToken from '../middleware/auth.js';
import allowRoles from '../middleware/roleCheck.js';

const router = express.Router();

// Protect all admin routes - require admin role
router.use(verifyToken, allowRoles('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/approve', approveUser);
router.patch('/users/:id/reject', rejectUser);
router.get('/contacts', getContacts);
router.patch('/contacts/:id/reply', replyContact);

export default router;
=======
const express = require('express');
const router = express.Router();
const {
  getStoreOrders,
  getStoreDeliveries,
  getStorePayments,
  getStoreStats,
  updateOrderStatus,
  createProduct,
  getStoreProducts,
  createDeliveryPerson,
  getStoreDeliveryPersons,
  deleteDeliveryPerson,
} = require('../controllers/adminController');

// GET /api/admin/stores/:storeName/orders
router.get('/stores/:storeName/orders', getStoreOrders);

// GET /api/admin/stores/:storeName/deliveries
router.get('/stores/:storeName/deliveries', getStoreDeliveries);

// GET /api/admin/stores/:storeName/payments
router.get('/stores/:storeName/payments', getStorePayments);

// GET /api/admin/stores/:storeName/stats
router.get('/stores/:storeName/stats', getStoreStats);

// PUT /api/admin/stores/:storeName/orders/:orderId/status
router.put('/stores/:storeName/orders/:orderId/status', updateOrderStatus);

// GET /api/admin/stores/:storeName/products
router.get('/stores/:storeName/products', getStoreProducts);

// POST /api/admin/stores/:storeName/products
router.post('/stores/:storeName/products', createProduct);

// GET /api/admin/stores/:storeName/delivery-persons
router.get('/stores/:storeName/delivery-persons', getStoreDeliveryPersons);

// POST /api/admin/stores/:storeName/delivery-persons
router.post('/stores/:storeName/delivery-persons', createDeliveryPerson);

// DELETE /api/admin/stores/:storeName/delivery-persons/:personId
router.delete('/stores/:storeName/delivery-persons/:personId', deleteDeliveryPerson);

module.exports = router;
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
