const express = require('express');
const router = express.Router();
const { getShops, getProductsByShop } = require('../controllers/shopController');

// GET /api/shops
router.get('/', getShops);

// GET /api/shops/:shopId/products
router.get('/:shopId/products', getProductsByShop);

module.exports = router;
