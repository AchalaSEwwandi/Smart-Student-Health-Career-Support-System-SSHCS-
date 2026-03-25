const express = require('express');
const router = express.Router();
const {
  createOrder,
  calculatePayment,
  processPayment,
  assignDelivery,
  getOrderTracking,
  updateOrderStatus,
  confirmDelivery,
  submitRating,
  getOrderHistory,
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

// PUT /api/orders/:orderId/status - update order status
router.put('/:orderId/status', updateOrderStatus);

// POST /api/orders/:orderId/confirm - confirm delivery
router.post('/:orderId/confirm', confirmDelivery);

// POST /api/orders/rate - submit rating
router.post('/rate', submitRating);

module.exports = router;
