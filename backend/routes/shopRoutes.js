<<<<<<< HEAD
import express from 'express';
import upload from '../middleware/upload.js';
import {
  getShops,
  getShop,
  getProductsByShop,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/shopController.js';

const router = express.Router();

// Public routes
router.get('/shops', getShops);
router.get('/shops/:shopId', getShop);
router.get('/shops/:shopId/products', getProductsByShop);

// Protected routes (admin/shop_owner)
router.post('/products', upload.single('image'), createProduct);
router.get('/products/:productId',  getProduct);
router.put('/products/:productId', upload.single('image'), updateProduct);
router.delete('/products/:productId',  deleteProduct);

export default router;
=======
const express = require('express');
const router = express.Router();
const { getShops, getProductsByShop } = require('../controllers/shopController');

// GET /api/shops
router.get('/', getShops);

// GET /api/shops/:shopId/products
router.get('/:shopId/products', getProductsByShop);

module.exports = router;
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
