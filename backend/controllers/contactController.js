const ContactRequest = require('../models/ContactRequest');
const User = require('../models/User');
const sendWelcomeEmail = require('../utils/sendWelcomeEmail');

// @desc    Submit a contact request
// @route   POST /api/public/contact
// @access  Public
exports.submitContactRequest = async (req, res) => {
  try {
    const { name, email, phone, inquiry_type, message, shop_name, shop_type, address, description } = req.body;

    const request = await ContactRequest.create({
      name,
      email,
      phone,
      inquiry_type,
      message,
      shop_name,
      shop_type,
      address,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Contact request submitted successfully',
      data: request
    });
  } catch (error) {
    console.error('Error submitting contact request:', error.message);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all contact requests (Filter by type)
// @route   GET /api/admin/contact-requests
// @access  Private/Admin
exports.getContactRequests = async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = {};
    if (type) {
      query.inquiry_type = type;
    }

    const requests = await ContactRequest.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching contact requests:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Approve a shop request
// @route   PUT /api/admin/contact-requests/:id/approve
// @access  Private/Admin
exports.approveShopRequest = async (req, res) => {
  try {
    const request = await ContactRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.inquiry_type !== 'shop_request') {
      return res.status(400).json({ success: false, message: 'Only shop requests can be approved' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: request.email });
    if (existingUser) {
       return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    // Create user logic
    // We generate a random password, or a default one since it's an admin approval.
    // For simplicity, generate a simple 8-digit password and ideally send an email
    const generatedPassword = Math.random().toString(36).slice(-8);

    const newUser = await User.create({
      name: request.name,
      email: request.email,
      password: generatedPassword, 
      role: 'shop_owner',
      phone: request.phone,
      shopName: request.shop_name,
      shopType: request.shop_type ? request.shop_type.toLowerCase() : undefined,
      shopAddress: request.address
    });

    // Update request status
    request.status = 'approved';
    await request.save();

    // Send welcome email with credentials
    try {
      await sendWelcomeEmail({
        to: newUser.email,
        subject: 'Welcome to CareMate - Your Shop Owner Account is Ready!',
        name: newUser.name,
        email: newUser.email,
        password: generatedPassword
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError.message);
      // Non-blocking: we still return success below but the admin UI will show the temp password anyway
    }

    res.status(200).json({
      success: true,
      message: 'Shop request approved and shop owner user created',
      data: request,
      tempPassword: generatedPassword 
    });

  } catch (error) {
    console.error('Error approving request:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Reject a shop request
// @route   PUT /api/admin/contact-requests/:id/reject
// @access  Private/Admin
exports.rejectShopRequest = async (req, res) => {
  try {
    const request = await ContactRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.inquiry_type !== 'shop_request') {
      return res.status(400).json({ success: false, message: 'Only shop requests can be rejected' });
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Shop request rejected',
      data: request
    });
  } catch (error) {
    console.error('Error rejecting request:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
