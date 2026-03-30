const User = require('../models/User');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');

// Temporary simplistic login logic that still writes to the DB to create proper IDs
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Simplistic check
    let user = await User.findOne({ email });
    if (!user) {
        user = new User({ name, email, password: password || '123', role });
        await user.save();

        if (role === 'doctor') {
            const doctor = new Doctor({
              userId: user._id,
              specialization: req.body.specialization || 'General',
              consultationFee: req.body.consultationFee || 500
            });
            await doctor.save();
        }
    }

    res.status(201).json({ message: 'Registered temporarily and saved to database' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });

    // Temporary feature: if trying to login and user doesn't exist, create it auto
    if (!user) {
        return res.status(400).json({ message: 'Email not found. Please register first.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, 'temporary_secret', { expiresIn: '1d' });
    
    let extraData = {};
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) extraData.doctorId = doctor._id;
    }

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, ...extraData } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
