<<<<<<< HEAD
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import DeliveryAssignment from '../models/DeliveryAssignment.js';
import DeliveryPerson from '../models/DeliveryPerson.js';
import Product from '../models/Product.js';
import { analyzeSentiment } from '../utils/index.js';

/**
 * POST /api/orders
 * Create a new order
 */
export const createOrder = async (req, res, next) => {
  try {
    const { shopId, shopName, items, deliveryAddress, studentId } = req.body;
=======
const Order = require('../models/Order');
const User = require('../models/User');
const DeliveryAssignment = require('../models/DeliveryAssignment');
const DeliveryPerson = require('../models/DeliveryPerson');
const Payment = require('../models/Payment');
const Rating = require('../models/Rating');

// POST create order
const createOrder = async (req, res) => {
  try {
    const { shopId, shopName, items, deliveryAddress } = req.body;
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

<<<<<<< HEAD
    // Session key from header (for demo) - will be replaced with userId from auth later
    const sessionKey = studentId || req.headers['x-session-key'] || 'demo';
=======
    // Session key from header (browser-generated, stored in localStorage)
    const sessionKey = req.headers['x-session-key'] || 'demo';
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = 50;
    const grandTotal = totalAmount + deliveryCharge;

    const order = new Order({
      studentId: sessionKey,
<<<<<<< HEAD
      shop: shopId || null,
      shopName: shopName || shopId || 'Campus Shop',
      items: items.map((i) => ({
        product: i.product || null,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
=======
      shopName: shopName || shopId || 'Campus Shop',
      items: items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        // product ObjectId is optional — omit it if it looks like a string name
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
      })),
      totalAmount,
      deliveryCharge,
      grandTotal,
      deliveryAddress: deliveryAddress || 'Campus',
      status: 'Pending',
    });

    await order.save();
<<<<<<< HEAD
    res.status(201).json({ success: true, message: 'Order created successfully', data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/history
 * Get order history for current user/session
 */
export const getOrderHistory = async (req, res, next) => {
  try {
    const sessionKey = req.headers['x-session-key'];

    let query = {};
    
    // If the user includes a role in the query or header, bypass student filtering if they are admin/vendor
    const userRole = req.user?.role;
    
    if (userRole === 'shop_owner' || userRole === 'admin' || userRole === 'delivery_person') {
      // Vendors/Admins/Delivery can view all orders (filtered on frontend or advanced query later)
    } else if (sessionKey && sessionKey !== 'demo') {
      query = { studentId: sessionKey };
    } else if (req.user && req.user.role === 'student') {
      query = { studentId: req.user.id.toString() }; // The JWT token payload has `id`, not `_id` typically
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:orderId/payment
 * Calculate payment details for an order
 */
export const calculatePayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
=======
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET calculate payment for an order
const calculatePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62

    res.json({
      success: true,
      data: {
        itemTotal: order.totalAmount,
        deliveryCharge: order.deliveryCharge,
        grandTotal: order.grandTotal,
      },
    });
  } catch (error) {
<<<<<<< HEAD
    next(error);
  }
};

/**
 * POST /api/orders/pay
 * Process payment for an order (mock/stub for demo)
 */
export const processPayment = async (req, res, next) => {
  try {
    const { orderId, cardType, nameOnCard, cardNumber, expiryDate, cvv } = req.body;

=======
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST process payment (mock)
const processPayment = async (req, res) => {
  try {
    const { orderId, cardType, nameOnCard, cardNumber, expiryDate, cvv } = req.body;

    // Server side basic validations
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
    if (!cardType || !nameOnCard || !cardNumber || !expiryDate || !cvv) {
      return res.status(400).json({ success: false, message: 'All payment fields are required' });
    }
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      return res.status(400).json({ success: false, message: 'Card number must be 16 digits' });
    }
    if (cvv.length !== 3) {
      return res.status(400).json({ success: false, message: 'CVV must be 3 digits' });
    }

    const order = await Order.findById(orderId);
<<<<<<< HEAD
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
=======
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62

    const payment = new Payment({
      order: orderId,
      amount: order.grandTotal,
      cardType,
      nameOnCard,
      lastFourDigits: cardNumber.replace(/\s/g, '').slice(-4),
      status: 'Success',
    });
<<<<<<< HEAD

    await payment.save();

// Keep order as Pending so Vendor can explicitly Accept it, but reduce stock immediately to reserve it.
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } }).catch(() => {});
        }
      }

      res.json({ success: true, message: 'Payment successful, awaiting vendor acceptance.', data: payment });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/assign-delivery
 * Auto-assign a delivery person to an order
 */
export const assignDelivery = async (req, res, next) => {
  try {
    const { orderId, storeName } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
=======
    await payment.save();

    // Move order to Processing
    order.status = 'Processing';
    await order.save();

    res.json({ success: true, message: 'Payment successful', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST auto-assign delivery person
const assignDelivery = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62

    // Check if already assigned
    const existing = await DeliveryAssignment.findOne({ order: orderId });
    if (existing) {
<<<<<<< HEAD
      return res.json({
        success: true,
        message: 'Delivery already assigned',
        data: { deliveryPersonName: existing.deliveryPersonName, assignment: existing },
      });
    }

    // Build the query to check storeName (could match order's shopName or the given vendor storeName)
    const storeNamesToCheck = [order.shopName];
    if (storeName && storeName !== order.shopName) {
      storeNamesToCheck.push(storeName);
    }

    // Find an available delivery person for this store
    const dp = await DeliveryPerson.findOne({
      storeName: { $in: storeNamesToCheck },
=======
      return res.json({ success: true, data: { deliveryPersonName: existing.deliveryPersonName, assignment: existing } });
    }

    // Find an Available delivery person for this store (real persons only — no fallback)
    const dp = await DeliveryPerson.findOne({
      storeName:    order.shopName,
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
      availability: 'Available',
    });

    if (!dp) {
<<<<<<< HEAD
=======
      // No real delivery person available — do not create a fake assignment
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
      return res.status(200).json({
        success: false,
        assigned: false,
        message: `No delivery person available for ${order.shopName}. Please try again later.`,
      });
    }

    // Mark the delivery person as Busy
    dp.availability = 'Busy';
    await dp.save();

    const assignment = new DeliveryAssignment({
<<<<<<< HEAD
      order: orderId,
      deliveryPerson: dp._id,
      deliveryPersonName: dp.fullName,
      deliveryPersonPhone: dp.phone,
      vehicleType: dp.vehicleType,
      vehicleNumber: dp.vehicleNumber,
    });

=======
      order:               orderId,
      deliveryPerson:      dp._id,
      deliveryPersonName:  dp.fullName,
      deliveryPersonPhone: dp.phone,
      vehicleType:         dp.vehicleType,
      vehicleNumber:       dp.vehicleNumber,
    });
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
    await assignment.save();

    order.status = 'Processing';
    await order.save();

<<<<<<< HEAD
    res.json({
      success: true,
      assigned: true,
      message: 'Delivery person assigned successfully',
      data: { deliveryPersonName: dp.fullName, assignment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/tracking/:orderId
 * Get order tracking information
 */
export const getOrderTracking = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('shop', 'name');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
=======
    res.json({ success: true, assigned: true, data: { deliveryPersonName: dp.fullName, assignment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET order tracking
const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('shop', 'name');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62

    const assignment = await DeliveryAssignment.findOne({ order: orderId });

    res.json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
<<<<<<< HEAD
        shopId: order.shop ? order.shop._id : null,
=======
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
        shopName: order.shop ? order.shop.name : order.shopName || '',
        grandTotal: order.grandTotal,
        deliveryPersonName: assignment ? assignment.deliveryPersonName : 'Waiting for assignment…',
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
<<<<<<< HEAD
    next(error);
  }
};

/**
 * PUT /api/orders/:orderId/status
 * Update order status
 */
export const updateOrderStatus = async (req, res, next) => {
=======
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET delivery tracking — enriched view for DeliveryTracking page
// Also auto-assigns a delivery person from DeliveryPerson collection if none exists
const getDeliveryTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Auto-assign delivery person if not already assigned (real persons only — no fallback)
    let assignment = await DeliveryAssignment.findOne({ order: orderId });
    let assignmentPending = false;

    if (!assignment) {
      const dp = await DeliveryPerson.findOne({
        storeName:    order.shopName,
        availability: 'Available',
      }).catch(() => null);

      if (dp) {
        // Mark the person as Busy so they aren't double-assigned
        dp.availability = 'Busy';
        await dp.save().catch(() => {});

        assignment = new DeliveryAssignment({
          order:               orderId,
          deliveryPerson:      dp._id,
          deliveryPersonName:  dp.fullName,
          deliveryPersonPhone: dp.phone,
          vehicleType:         dp.vehicleType,
          vehicleNumber:       dp.vehicleNumber,
        });
        await assignment.save().catch(() => {});
      } else {
        // No real delivery person available — do not create a fake assignment
        assignmentPending = true;
      }
    }

    res.json({
      success: true,
      assignmentPending,
      data: {
        orderId:             order._id,
        storeName:           order.shopName || 'Campus Shop',
        deliveryPersonName:  assignment ? assignment.deliveryPersonName : '',
        deliveryPersonPhone: assignment ? (assignment.deliveryPersonPhone || '') : '',
        vehicleType:         assignment ? (assignment.vehicleType  || '') : '',
        vehicleNumber:       assignment ? (assignment.vehicleNumber || '') : '',
        status:              order.status,
        grandTotal:          order.grandTotal,
        deliveryAddress:     order.deliveryAddress || '',
        deliveryArea:        order.deliveryArea    || '',
        telephone:           order.telephone       || '',
        createdAt:           order.createdAt,
        updatedAt:           order.updatedAt || order.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT mark order as Delivered (called by frontend simulation on completion)
const markDelivered = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'Delivered' },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Free up the delivery person (mark Available again)
    const assignment = await DeliveryAssignment.findOne({ order: orderId });
    if (assignment && assignment.deliveryPerson) {
      await DeliveryPerson.findByIdAndUpdate(assignment.deliveryPerson, { availability: 'Available' }).catch(() => {});
    }

    res.json({ success: true, message: 'Order marked as Delivered', data: { status: order.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update order status
const updateOrderStatus = async (req, res) => {
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Out for Delivery', 'Delivered'];
<<<<<<< HEAD

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/:orderId/confirm-delivery
 * Confirm delivery completion
 */
export const confirmDelivery = async (req, res, next) => {
=======
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST confirm delivery
const confirmDelivery = async (req, res) => {
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'Delivered', isDeliveryConfirmed: true },
      { new: true }
    );
<<<<<<< HEAD

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Free up the delivery person
    const assignment = await DeliveryAssignment.findOne({ order: orderId });
    if (assignment && assignment.deliveryPerson) {
      await DeliveryPerson.findByIdAndUpdate(assignment.deliveryPerson, { availability: 'Available' }).catch(() => {});
    }

    res.json({ success: true, message: 'Delivery confirmed!', data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/:orderId/rate
 * Submit rating for delivery
 */
export const submitRating = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { stars, comment } = req.body;

=======
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Delivery confirmed!', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST submit rating
const submitRating = async (req, res) => {
  try {
    const { orderId, stars, comment } = req.body;
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

<<<<<<< HEAD
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Find delivery assignment
    const assignment = await DeliveryAssignment.findOne({ order: orderId });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'No delivery person assigned to this order' });
    }

    // Check if already rated
    const existingRating = await Payment.findOne({ order: orderId }); // Using Payment as placeholder for rating
    if (existingRating) {
      return res.status(400).json({ success: false, message: 'Order already rated' });
    }

    const rating = new Payment({
      order: orderId,
      amount: 0, // Not used for rating
      cardType: 'Visa', // placeholder
      nameOnCard: 'Rater',
      lastFourDigits: '0000',
      status: 'Success',
    });

    await rating.save();

    // Mark order as rated
    order.isRated = true;
    await order.save();

    res.json({ success: true, message: 'Rating submitted!', data: rating });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/:orderId/save-delivery-details
 * Save delivery address and contact details
 */
export const saveDeliveryAddress = async (req, res, next) => {
=======
    const assignment = await DeliveryAssignment.findOne({ order: orderId }).catch(() => null);
    const deliveryPersonId = assignment ? assignment.deliveryPerson : '000000000000000000000002';
    const sessionKey = req.headers['x-session-key'] || 'demo';

    const rating = new Rating({
      order: orderId,
      student: '000000000000000000000001', // placeholder ObjectId for schema compat
      deliveryPerson: deliveryPersonId,
      stars,
      comment: comment || '',
    });
    await rating.save();

    // Mark the order as rated
    await Order.findByIdAndUpdate(orderId, { isRated: true });

    res.json({ success: true, message: 'Rating submitted!', data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST save delivery address details
const saveDeliveryAddress = async (req, res) => {
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
  try {
    const { orderId } = req.params;
    const { deliveryArea, deliveryAddress, telephone, email, confirmedOrder } = req.body;

<<<<<<< HEAD
    // Validations
=======
    // Backend validation
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
    const validAreas = ['Inside Campus', 'Outside Campus (around 1km)'];
    if (!deliveryArea || !validAreas.includes(deliveryArea)) {
      return res.status(400).json({ success: false, message: 'Delivery area must be selected' });
    }
    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({ success: false, message: 'Delivery address is required' });
    }
    if (!telephone || !telephone.trim()) {
      return res.status(400).json({ success: false, message: 'Telephone number is required' });
    }
    if (/[^0-9]/.test(telephone)) {
      return res.status(400).json({ success: false, message: 'Only numbers are allowed' });
    }
    if (telephone.length < 10) {
      return res.status(400).json({ success: false, message: 'Telephone number must be at least 10 digits' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Email must be a valid format' });
    }
    if (!confirmedOrder) {
      return res.status(400).json({ success: false, message: 'You must confirm the order details' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
<<<<<<< HEAD
      {
        deliveryArea,
        deliveryAddress: deliveryAddress.trim(),
        telephone: telephone.trim(),
        email: email.trim(),
        confirmedOrder: true,
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Delivery details saved', data: order });
  } catch (error) {
    next(error);
  }
};
=======
      { deliveryArea, deliveryAddress: deliveryAddress.trim(), telephone: telephone.trim(), email: email.trim(), confirmedOrder: true },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, message: 'Delivery details saved', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET order history — filtered by session key
const getOrderHistory = async (req, res) => {
  try {
    const sessionKey = req.headers['x-session-key'];

    let query = {};
    if (sessionKey && sessionKey !== 'demo') {
      // Return only orders for this browser session
      query = { studentId: sessionKey };
    }
    // If no session key provided, return empty (don't leak all orders)
    const orders = await Order.find(query).sort({ createdAt: -1 });

    // Build enriched response with all needed fields
    const enriched = orders.map((o) => ({
      _id: o._id,
      shopName: o.shopName || 'Campus Shop',
      shop: { name: o.shopName || 'Campus Shop' },
      items: o.items || [],
      totalAmount: o.totalAmount,
      deliveryCharge: o.deliveryCharge,
      grandTotal: o.grandTotal,
      status: o.status,
      deliveryAddress: o.deliveryAddress,
      isRated: o.isRated,
      isDeliveryConfirmed: o.isDeliveryConfirmed,
      createdAt: o.createdAt,
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
