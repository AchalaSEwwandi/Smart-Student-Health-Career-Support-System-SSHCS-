const Message = require('../models/Message');
const User = require('../models/User');
const { sendMessageReplyEmail } = require('../utils/sendEmail');

// @desc    Create a new message
// @route   POST /api/messages
// @access  Private (Student)
exports.createMessage = async (req, res) => {
  try {
    const { receiverId, receiverType, subject, message } = req.body;

    if (!receiverId || !receiverType || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (!['doctor', 'shop_owner'].includes(receiverType)) {
      return res.status(400).json({ success: false, message: 'Invalid receiverType. Must be doctor or shop_owner' });
    }

    if (subject.length < 5) {
      return res.status(400).json({ success: false, message: 'Subject must be at least 5 characters' });
    }

    if (message.length < 10) {
      return res.status(400).json({ success: false, message: 'Message must be at least 10 characters' });
    }

    const newMessage = await Message.create({
      senderId: req.user.id,
      receiverId,
      receiverType,
      subject,
      message,
    });

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating message', error: error.message });
  }
};

// @desc    Get messages sent by the logged in student
// @route   GET /api/messages/my
// @access  Private (Student)
exports.getMyMessages = async (req, res) => {
  try {
    const messages = await Message.find({ senderId: req.user.id })
      .populate('receiverId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
  }
};

// @desc    Get messages received by the logged in vendor (doctor/shop_owner)
// @route   GET /api/messages/received
// @access  Private (Doctor / Shop Owner)
exports.getReceivedMessages = async (req, res) => {
  try {
    const messages = await Message.find({ receiverId: req.user.id })
      .populate('senderId', 'name email studentId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching received messages', error: error.message });
  }
};

// @desc    Reply to a message
// @route   PUT /api/messages/:id/reply
// @access  Private (Doctor / Shop Owner)
exports.replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply || reply.trim() === '') {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }

    const message = await Message.findById(req.params.id).populate('senderId', 'name email');

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Ensure the user replying is the receiver
    if (message.receiverId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reply to this message' });
    }

    message.reply = reply;
    message.status = 'replied';
    await message.save();

    // Send email to student
    if (message.senderId && message.senderId.email) {
      try {
        await sendMessageReplyEmail({
          to: message.senderId.email,
          studentName: message.senderId.name,
          vendorName: req.user.name,
          subject: message.subject,
          originalMessage: message.message,
          reply: message.reply,
        });
      } catch (emailError) {
        console.error('Error sending reply email:', emailError);
        // We still return success but maybe log the email error
      }
    }

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error replying to message', error: error.message });
  }
};
