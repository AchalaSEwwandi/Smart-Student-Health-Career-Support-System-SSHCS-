const express = require('express');
const router = express.Router();
const {
  getStoreOrders,
  getStoreDeliveries,
  getStorePayments,
  getStoreStats,
  updateOrderStatus,
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

module.exports = router;
