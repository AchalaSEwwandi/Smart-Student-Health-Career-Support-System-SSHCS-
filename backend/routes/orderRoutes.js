<<<<<<< HEAD
import express from 'express';
import verifyToken from '../middleware/auth.js'; // Added missing auth middleware for checking user
import {
  createOrder,
  getOrderHistory,
=======
const express = require('express');
const router = express.Router();
const {
  createOrder,
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
  calculatePayment,
  processPayment,
  assignDelivery,
  getOrderTracking,
<<<<<<< HEAD
  updateOrderStatus,
  confirmDelivery,
  submitRating,
  saveDeliveryAddress,
} from '../controllers/orderController.js';

const router = express.Router();

// Try to verify token if exists (for optional auth routes), or use strict verifyToken
const optionalAuth = (req, res, next) => {
  // we try to parse it if Bearer is present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
};

// Order creation - requires auth but can accept session key for demo
router.post('/', optionalAuth, createOrder);
router.get('/history', optionalAuth, getOrderHistory);
router.get('/:orderId/payment', optionalAuth, calculatePayment);
router.post('/pay',  processPayment);
router.post('/assign-delivery',  assignDelivery);
router.get('/tracking/:orderId',  getOrderTracking);
router.put('/:orderId/status',  updateOrderStatus);
router.post('/:orderId/confirm-delivery',  confirmDelivery);
router.post('/:orderId/rate',  submitRating);
router.post('/:orderId/save-delivery-details',  saveDeliveryAddress);

export default router;
=======
  getDeliveryTracking,
  markDelivered,
  updateOrderStatus,
  confirmDelivery,
  submitRating,
  getOrderHistory,
  saveDeliveryAddress,
} = require('../controllers/orderController');

// POST /api/orders - create order
router.post('/', createOrder);

// GET /api/orders/history - get order history
router.get('/history', getOrderHistory);

// GET /api/orders/:orderId/payment - calculate payment
router.get('/:orderId/payment', calculatePayment);

// POST /api/orders/pay - process payment
router.post('/pay', processPayment);

// POST /api/orders/assign-delivery - assign delivery person
router.post('/assign-delivery', assignDelivery);

// GET /api/orders/:orderId/tracking - get tracking info
router.get('/:orderId/tracking', getOrderTracking);

// GET /api/orders/:orderId/delivery-tracking - enriched delivery tracking page
router.get('/:orderId/delivery-tracking', getDeliveryTracking);

// PUT /api/orders/:orderId/status - update order status
router.put('/:orderId/status', updateOrderStatus);

// PUT /api/orders/:orderId/mark-delivered - simulation writes Delivered to DB
router.put('/:orderId/mark-delivered', markDelivered);

// POST /api/orders/:orderId/confirm - confirm delivery
router.post('/:orderId/confirm', confirmDelivery);

// POST /api/orders/rate - submit rating
router.post('/rate', submitRating);

// POST /api/orders/:orderId/delivery-address - save delivery address details
router.post('/:orderId/delivery-address', saveDeliveryAddress);

module.exports = router;
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
