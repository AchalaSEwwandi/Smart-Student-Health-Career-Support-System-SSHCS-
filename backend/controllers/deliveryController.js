import DeliveryPerson from '../models/DeliveryPerson.js';
import DeliveryAssignment from '../models/DeliveryAssignment.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

/**
 * POST /api/delivery/persons
 * Create a delivery person (admin only)
 */
export const createDeliveryPerson = async (req, res, next) => {
  try {
    const { storeName, fullName, phone, nic, email, password, vehicleType, vehicleNumber, deliveryArea, availability } = req.body;

    if (!storeName || typeof storeName !== 'string' || !storeName.trim()) {
      return res.status(400).json({ success: false, message: 'Store name is required' });
    }
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    if (!nic || typeof nic !== 'string' || !nic.trim()) {
      return res.status(400).json({ success: false, message: 'NIC/ID is required' });
    }
    if (!vehicleType || typeof vehicleType !== 'string') {
      return res.status(400).json({ success: false, message: 'Vehicle type is required' });
    }
    if (!vehicleNumber || typeof vehicleNumber !== 'string' || !vehicleNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Vehicle number is required' });
    }
    if (!deliveryArea || typeof deliveryArea !== 'string' || !deliveryArea.trim()) {
      return res.status(400).json({ success: false, message: 'Delivery area is required' });
    }

    // Check if NIC already exists
    const existing = await DeliveryPerson.findOne({ nic: nic.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A delivery person with this NIC already exists' });
    }

    // Create a User account for the delivery person
    const generatedEmail = email ? email.toLowerCase() : `${nic.trim()}@delivery.com`;
    const user = new User({
      name: fullName.trim(),
      email: generatedEmail,
      password: password || nic.trim(), // Default password is NIC if not provided
      nic: nic.trim(),
      vehicleType: vehicleType,
    });
    
    await user.save();

    const person = new DeliveryPerson({
      userId: user._id,
      storeName: storeName.trim(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      nic: nic.trim(),
      vehicleType: vehicleType.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      deliveryArea: deliveryArea.trim(),
      availability: availability || 'Available',
    });

    await person.save();
    res.status(201).json({ success: true, message: 'Delivery person created successfully', data: person });
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryPerson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const person = await DeliveryPerson.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!person) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Delivery person updated', data: person });
  } catch (error) {
    next(error);
  }
};

export const deleteDeliveryPerson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const person = await DeliveryPerson.findByIdAndDelete(id);
    if (!person) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Delivery person deleted' });
  } catch (error) {
    next(error);
  }
};

export const assignDeliveryPerson = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { deliveryPersonId } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    const dp = await DeliveryPerson.findById(deliveryPersonId);
    if (!dp) return res.status(404).json({ success: false, message: 'Delivery person not found' });
    
    dp.availability = 'Busy';
    await dp.save();

    order.status = 'Ready for Pickup';
    await order.save();

    const assignment = new DeliveryAssignment({
      order: orderId,
      deliveryPerson: dp._id,
      deliveryPersonName: dp.fullName,
      deliveryPersonPhone: dp.phone,
      vehicleType: dp.vehicleType,
      vehicleNumber: dp.vehicleNumber,
    });
    
    await assignment.save();
    res.json({ success: true, message: 'Assigned successfully', data: assignment });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/delivery/persons
 * Get all delivery persons (optional filter by store)
 */
export const getDeliveryPersons = async (req, res, next) => {
  try {
    const { storeName } = req.query;
    const filter = storeName ? { storeName } : {};

    const persons = await DeliveryPerson.find(filter)
      .sort({ createdAt: -1 });

    res.json({ success: true, count: persons.length, data: persons });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/delivery/tracking/:orderId
 * Get delivery tracking details (auto-assigns if not assigned)
 */
export const getDeliveryTracking = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Populate assignment and delivery person details
    let assignment = await DeliveryAssignment.findOne({ order: orderId }).populate('deliveryPerson');
    let assignmentPending = !assignment;

    res.json({
      success: true,
      assignmentPending,
      data: {
        orderId: order._id,
        storeName: order.shopName || 'Campus Shop',
        status: order.status,
        totalAmount: order.totalAmount,
        deliveryAddress: order.deliveryAddress,
        deliveryPersonName: assignment?.deliveryPerson?.fullName || assignment?.deliveryPersonName || '',
        deliveryPersonPhone: assignment?.deliveryPerson?.phone || '',
        vehicleType: assignment?.deliveryPerson?.vehicleType || '',
        vehicleNumber: assignment?.deliveryPerson?.vehicleNumber || '',
        updatedAt: order.updatedAt || order.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/delivery/:orderId/mark-delivered
 * Mark an order as delivered and free up delivery person
 */
export const markDelivered = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'Delivered' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Free up the delivery person
    const assignment = await DeliveryAssignment.findOne({ order: orderId });
    if (assignment && assignment.deliveryPerson) {
      await DeliveryPerson.findByIdAndUpdate(assignment.deliveryPerson, { availability: 'Available' }).catch(() => {});
    }

    res.json({
      success: true,
      message: 'Order marked as Delivered',
      data: { status: order.status },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/delivery/stats
 * Get delivery statistics (for admin)
 */
export const getDeliveryStats = async (req, res, next) => {
  try {
    const totalPersons = await DeliveryPerson.countDocuments();
    const availablePersons = await DeliveryPerson.countDocuments({ availability: 'Available' });
    const activeAssignments = await DeliveryAssignment.countDocuments();

    res.json({
      success: true,
      data: {
        totalDeliveryPersons: totalPersons,
        availableDeliveryPersons: availablePersons,
        activeAssignments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/delivery/my-assignments
 * Get assignments for the logged-in delivery person
 */
export const getMyAssignments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const person = await DeliveryPerson.findOne({ userId });
    
    if (!person) {
      return res.status(404).json({ success: false, message: 'Delivery person profile not found for this user.' });
    }

    // Get assignments
    const assignments = await DeliveryAssignment.find({ deliveryPerson: person._id }).populate('order').sort({ createdAt: -1 });

    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/delivery/my-dashboard
 * Get stats for the logged-in delivery person
 */
export const getMyDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const person = await DeliveryPerson.findOne({ userId });
    
    if (!person) {
      return res.status(404).json({ success: false, message: 'Delivery person profile not found for this user.' });
    }

    const assignments = await DeliveryAssignment.find({ deliveryPerson: person._id }).populate('order');
    
      const active = assignments.filter(a => a.order && ['Accepted', 'Ready for Pickup', 'Out for Delivery'].includes(a.order.status)).length;
    const completed = assignments.filter(a => a.order && a.order.status === 'Delivered').length;
    const pending = assignments.filter(a => a.order && a.order.status === 'Pending').length;

    // Recent deliveries
    const recentDeliveries = assignments.slice(0, 5).map(a => ({
      id: a.order ? a.order._id : a._id,
      shop: a.order ? a.order.shopName : 'Unknown Shop',
      dest: a.order ? a.order.deliveryAddress : 'Unknown location',
      status: a.order ? a.order.status : 'Unknown',
      time: a.createdAt
    }));

    res.json({
      success: true,
      data: {
        stats: { active, completed, pending },
        recentDeliveries
      }
    });
  } catch (error) {
    next(error);
  }
};


