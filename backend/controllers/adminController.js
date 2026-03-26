const Order = require('../models/Order');
const DeliveryAssignment = require('../models/DeliveryAssignment');
const Payment = require('../models/Payment');

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
      _id:                d._id,
      orderId:            d.order,
      deliveryPersonName: d.deliveryPersonName || 'Unassigned',
      assignedAt:        d.assignedAt,
      status:            d.isAvailable ? 'Delivered' : 'In Progress',
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

module.exports = { getStoreOrders, getStoreDeliveries, getStorePayments, getStoreStats, updateOrderStatus };
