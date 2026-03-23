const express = require('express');
const router = express.Router();
const { getTopDeliveryPersons, getTopShops, getTopRatedAll, getPublicProfile } = require('../controllers/publicController');

// No authentication required
router.get('/top-delivery-persons', getTopDeliveryPersons);
router.get('/top-shops', getTopShops);
router.get('/top-rated-all', getTopRatedAll);
router.get('/profile/:id', getPublicProfile);

module.exports = router;
