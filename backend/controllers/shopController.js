const Shop = require('../models/Shop');
const Product = require('../models/Product');

// GET all shops
const getShops = async (req, res) => {
  try {
    const shops = await Shop.find({ isActive: true });
    res.json({ success: true, data: shops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET products by shop ID
const getProductsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const products = await Product.find({ shop: shopId, isAvailable: true });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getShops, getProductsByShop };
