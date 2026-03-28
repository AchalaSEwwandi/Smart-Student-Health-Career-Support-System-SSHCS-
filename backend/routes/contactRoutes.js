const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { body, validationResult } = require('express-validator');

// @route   POST /api/contact
// @desc    Submit a new contact message (Public)
router.post('/', 
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('subject', 'Subject is required').not().isEmpty(),
    body('message', 'Message is required').not().isEmpty(),
  ],
  async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, subject, message } = req.body;

      const newContact = new Contact({
        name,
        email,
        subject,
        message
      });

      await newContact.save();

      res.status(201).json({
        success: true,
        message: 'Message sent successfully'
      });
    } catch (err) {
      console.error('Contact Submission Error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

module.exports = router;
