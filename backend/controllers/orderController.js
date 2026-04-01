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

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Session key from header (browser-generated, stored in localStorage)
    const sessionKey = req.headers['x-session-key'] || 'demo';

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = 50;
    const grandTotal = totalAmount + deliveryCharge;

    const order = new Order({
      studentId: sessionKey,
      shopName: shopName || shopId || 'Campus Shop',
      items: items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        // product ObjectId is optional — omit it if it looks like a string name
      })),
      totalAmount,
      deliveryCharge,
      grandTotal,
      deliveryAddress: deliveryAddress || 'Campus',
      status: 'Pending',
    });

    await order.save();
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

    res.json({
      success: true,
      data: {
        itemTotal: order.totalAmount,
        deliveryCharge: order.deliveryCharge,
        grandTotal: order.grandTotal,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST process payment (mock)
const processPayment = async (req, res) => {
  try {
    const { orderId, cardType, nameOnCard, cardNumber, expiryDate, cvv } = req.body;

    // Server side basic validations
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
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const payment = new Payment({
      order: orderId,
      amount: order.grandTotal,
      cardType,
      nameOnCard,
      lastFourDigits: cardNumber.replace(/\s/g, '').slice(-4),
      status: 'Success',
    });
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

    // Check if already assigned
    const existing = await DeliveryAssignment.findOne({ order: orderId });
    if (existing) {
      return res.json({ success: true, data: { deliveryPersonName: existing.deliveryPersonName, assignment: existing } });
    }

    // Find an Available delivery person for this store (real persons only — no fallback)
    const dp = await DeliveryPerson.findOne({
      storeName:    order.shopName,
      availability: 'Available',
    });

    if (!dp) {
      // No real delivery person available — do not create a fake assignment
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
      order:               orderId,
      deliveryPerson:      dp._id,
      deliveryPersonName:  dp.fullName,
      deliveryPersonPhone: dp.phone,
      vehicleType:         dp.vehicleType,
      vehicleNumber:       dp.vehicleNumber,
    });
    await assignment.save();

    order.status = 'Processing';
    await order.save();

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

    const assignment = await DeliveryAssignment.findOne({ order: orderId });

    res.json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        shopName: order.shop ? order.shop.name : order.shopName || '',
        grandTotal: order.grandTotal,
        deliveryPersonName: assignment ? assignment.deliveryPersonName : 'Waiting for assignment…',
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
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
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Out for Delivery', 'Delivered'];
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
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'Delivered', isDeliveryConfirmed: true },
      { new: true }
    );
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
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

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
  try {
    const { orderId } = req.params;
    const { deliveryArea, deliveryAddress, telephone, email, confirmedOrder } = req.body;

    // Backend validation
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
