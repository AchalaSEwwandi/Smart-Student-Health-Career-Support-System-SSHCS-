<<<<<<< HEAD
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Contact from '../models/Contact.js';
import { sendApprovalEmail, sendContactReplyEmail } from '../utils/index.js';

/**
 * GET /api/admin/users
 * List users - optionally filter by role and/or status
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter).select('-password -refreshToken').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/users/:id/approve
 * Approve a pending doctor or vendor account
 */
export const approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.status === 'approved') {
      return res.status(400).json({ success: false, message: 'User is already approved.' });
    }

    user.status = 'approved';
    await user.save({ validateBeforeSave: false });

    // If the approved user is a doctor, automatically create the Doctor profile
    if (user.role === 'doctor') {
      const existingDoctor = await Doctor.findOne({ userId: user._id });
      if (!existingDoctor) {
        await Doctor.create({
          userId: user._id,
          specialization: user.specialization || 'General',
          consultationFee: 1000, // Default fee
        });
      }
    }

    // Send approval email
    await sendApprovalEmail({ to: user.email, name: user.name }).catch((err) =>
      console.error('Approval email failed:', err.message)
    );

    res.json({
      success: true,
      message: `${user.name}'s account has been approved. Notification email sent.`,
      data: { id: user._id, status: user.status },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/users/:id/reject
 * Reject (deactivate) a pending account
 */
export const rejectUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, message: `${user.name}'s account has been rejected.` });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/contacts
 * Get all contact form submissions
 */
export const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/contacts/:id/reply
 * Reply to a contact submission
 */
export const replyContact = async (req, res, next) => {
  try {
    const { replyText } = req.body;
    if (!replyText) return res.status(400).json({ success: false, message: 'Reply text is required.' });

    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found.' });

    if (contact.status === 'replied') {
      return res.status(400).json({ success: false, message: 'Already replied.' });
    }

    contact.status = 'replied';
    contact.replyMessage = replyText;
    contact.repliedAt = new Date();
    await contact.save();

    // Send reply email
    await sendContactReplyEmail({
      to: contact.email,
      name: contact.name,
      messageSubject: contact.subject,
      replyText: contact.replyMessage,
    }).catch((err) => console.error('Contact reply email failed:', err.message));

    res.json({ success: true, message: 'Reply sent successfully.', data: contact });
  } catch (err) {
    next(err);
  }
};
=======
const Order          = require('../models/Order');
const DeliveryAssignment = require('../models/DeliveryAssignment');
const Payment        = require('../models/Payment');
const Product        = require('../models/Product');
const DeliveryPerson = require('../models/DeliveryPerson');

/**
 * Normalise the :storeName URL segment to the full shopName string used in the DB.
 * URL param   →  DB shopName
 *   cargils   →  "Cargils"
 *   abenayaka →  "Abenayaka Stores"
 *   dewnini   →  "Dewnini Stores"
 */
const resolveShopName = (storeName) => {
  const map = {
    cargils:   'Cargils',
    abenayaka: 'Abenayaka Stores',
    dewnini:   'Dewnini Stores',
  };
  return map[storeName.toLowerCase()] || storeName;
};

// GET /api/admin/stores/:storeName/orders
const getStoreOrders = async (req, res) => {
  try {
    const shopName = resolveShopName(req.params.storeName);
    const orders = await Order.find({ shopName }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/stores/:storeName/deliveries
const getStoreDeliveries = async (req, res) => {
  try {
    const shopName = resolveShopName(req.params.storeName);

    // Find all orders for this store then look up their delivery assignments
    const orders = await Order.find({ shopName }).select('_id');
    const orderIds = orders.map((o) => o._id);

    const deliveries = await DeliveryAssignment.find({ order: { $in: orderIds } })
      .sort({ assignedAt: -1 });

    // Enrich with order id string for display
    const enriched = deliveries.map((d) => ({
      _id:                 d._id,
      orderId:             d.order,
      deliveryPersonName:  d.deliveryPersonName  || 'Unassigned',
      deliveryPersonPhone: d.deliveryPersonPhone || '',
      vehicleType:         d.vehicleType         || '',
      vehicleNumber:       d.vehicleNumber       || '',
      assignedAt:          d.assignedAt,
      status:              d.isAvailable ? 'Delivered' : 'In Progress',
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/stores/:storeName/payments
const getStorePayments = async (req, res) => {
  try {
    const shopName = resolveShopName(req.params.storeName);

    const orders = await Order.find({ shopName }).select('_id totalAmount deliveryCharge grandTotal');
    const orderIds = orders.map((o) => o._id);

    // Build lookup map: orderId → order amounts
    const orderMap = {};
    orders.forEach((o) => {
      orderMap[o._id.toString()] = {
        subtotal:       o.totalAmount,
        deliveryCharge: o.deliveryCharge,
        grandTotal:     o.grandTotal,
      };
    });

    const payments = await Payment.find({ order: { $in: orderIds } })
      .sort({ paidAt: -1 });

    const enriched = payments.map((p) => {
      const amounts = orderMap[p.order.toString()] || {};
      return {
        _id:            p._id,
        orderId:        p.order,
        cardType:       p.cardType,
        lastFourDigits: p.lastFourDigits,
        subtotal:       amounts.subtotal       || 0,
        deliveryCharge: amounts.deliveryCharge || 50,
        total:          p.amount,
        status:         p.status,
        paidAt:         p.paidAt,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/stores/:storeName/stats
const getStoreStats = async (req, res) => {
  try {
    const shopName = resolveShopName(req.params.storeName);
    const orders = await Order.find({ shopName });

    const totalOrders        = orders.length;
    const completedDeliveries = orders.filter((o) => o.status === 'Delivered').length;
    const pendingOrders      = orders.filter((o) => o.status === 'Pending').length;
    const totalRevenue       = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    res.json({
      success: true,
      data: { totalOrders, completedDeliveries, pendingOrders, totalRevenue },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/stores/:storeName/orders/:orderId/status
const updateOrderStatus = async (req, res) => {
  try {
    const shopName = resolveShopName(req.params.storeName);
    const { orderId } = req.params;
    const { status } = req.body;

    const STATUS_STEPS = ['Pending', 'Processing', 'Out for Delivery', 'Delivered'];
    if (!STATUS_STEPS.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.shopName !== shopName) {
      return res.status(403).json({ success: false, message: 'Order does not belong to this store' });
    }

    order.status = status;
    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/stores/:storeName/products
const createProduct = async (req, res) => {
  try {
    const storeName = resolveShopName(req.params.storeName);
    const { name, unit, description, category, price, stock, image, isAvailable } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: 'Product name is required' });
    if (!description || !description.trim())
      return res.status(400).json({ success: false, message: 'Description is required' });
    if (!category || !category.trim())
      return res.status(400).json({ success: false, message: 'Category is required' });
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0)
      return res.status(400).json({ success: false, message: 'Price must be a positive number' });
    if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0))
      return res.status(400).json({ success: false, message: 'Stock must be >= 0' });

    const product = await Product.create({
      name:        name.trim(),
      unit:        (unit || '').trim(),
      description: description.trim(),
      category:    category.trim(),
      price:       Number(price),
      stock:       Number(stock || 0),
      image:       image || '',
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      storeName,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/stores/:storeName/products
const getStoreProducts = async (req, res) => {
  try {
    const storeName = resolveShopName(req.params.storeName);
    const products = await Product.find({ storeName }).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/stores/:storeName/delivery-persons
const createDeliveryPerson = async (req, res) => {
  try {
    const storeName = resolveShopName(req.params.storeName);
    const { fullName, phone, nic, vehicleType, vehicleNumber, deliveryArea, availability } = req.body;

    if (!fullName  || !fullName.trim())       return res.status(400).json({ success: false, message: 'Full name is required' });
    if (!phone     || !phone.trim())          return res.status(400).json({ success: false, message: 'Phone number is required' });
    if (!nic       || !nic.trim())            return res.status(400).json({ success: false, message: 'NIC / ID is required' });
    if (!vehicleType)                         return res.status(400).json({ success: false, message: 'Vehicle type is required' });
    if (!vehicleNumber || !vehicleNumber.trim()) return res.status(400).json({ success: false, message: 'Vehicle number is required' });
    if (!deliveryArea)                        return res.status(400).json({ success: false, message: 'Delivery area is required' });

    const person = await DeliveryPerson.create({
      storeName,
      fullName:      fullName.trim(),
      phone:         phone.trim(),
      nic:           nic.trim(),
      vehicleType:   vehicleType.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      deliveryArea:  deliveryArea.trim(),
      availability:  availability || 'Available',
    });

    res.status(201).json({ success: true, data: person });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/stores/:storeName/delivery-persons
const getStoreDeliveryPersons = async (req, res) => {
  try {
    const storeName = resolveShopName(req.params.storeName);
    const persons   = await DeliveryPerson.find({ storeName }).sort({ createdAt: -1 });
    res.json({ success: true, data: persons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/stores/:storeName/delivery-persons/:personId
const deleteDeliveryPerson = async (req, res) => {
  try {
    const storeName = resolveShopName(req.params.storeName);
    const { personId } = req.params;

    const person = await DeliveryPerson.findById(personId);
    if (!person)
      return res.status(404).json({ success: false, message: 'Delivery person not found' });

    // Safety: only delete if this person belongs to the requesting store
    if (person.storeName !== storeName)
      return res.status(403).json({ success: false, message: 'This delivery person does not belong to your store' });

    await DeliveryPerson.findByIdAndDelete(personId);
    res.json({ success: true, message: 'Delivery person removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getStoreOrders,
  getStoreDeliveries,
  getStorePayments,
  getStoreStats,
  updateOrderStatus,
  createProduct,
  getStoreProducts,
  createDeliveryPerson,
  getStoreDeliveryPersons,
  deleteDeliveryPerson,
};
>>>>>>> 056594cc1b189653b6d1357f4be5300dff768d62
