const express = require('express');
const router = express.Router();
const {
  createOrder,
  calculatePayment,
  processPayment,
  assignDelivery,
  getOrderTracking,
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
