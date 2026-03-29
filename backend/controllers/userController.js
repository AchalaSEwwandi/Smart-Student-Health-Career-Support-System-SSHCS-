const User = require('../models/User');

/**
 * GET PROFILE
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE PROFILE (ROLE BASED)
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // ❗ Prevent changing sensitive fields
    const restrictedFields = ['password', 'email', 'userType'];
    restrictedFields.forEach(field => delete req.body[field]);

    // 🔍 Duplicate email check (if you allow email change later)
    if (req.body.email) {
      const existing = await User.findOne({
        email: req.body.email,
        _id: { $ne: userId }
      });
      if (existing) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // 🔍 Duplicate phone check
    if (req.body.phone) {
      const existingPhone = await User.findOne({
        phone: req.body.phone,
        _id: { $ne: userId }
      });
      if (existingPhone) {
        return res.status(400).json({ message: 'Phone already exists' });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let updateData = {
      name: req.body.name,
      phone: req.body.phone,
    };

    // 🎯 ROLE BASED FIELDS
    switch (user.userType) {

      case 'student':
        updateData = {
          ...updateData,
          studentId: req.body.studentId,
          year: req.body.year,
          semester: req.body.semester,
          degree: req.body.degree,
          gpa: req.body.gpa,
          specialization: req.body.specialization
        };
        break;

      case 'doctor':
        updateData = {
          ...updateData,
          specialization: req.body.specialization,
          licenseNumber: req.body.licenseNumber,
          availableSlots: req.body.availableSlots
        };
        break;

      case 'shop_owner':
        updateData = {
          ...updateData,
          shopName: req.body.shopName,
          shopType: req.body.shopType,
          shopAddress: req.body.shopAddress
        };
        break;

      case 'driver':
        updateData = {
          ...updateData,
          vehicleType: req.body.vehicleType,
          currentLocation: req.body.currentLocation,
          licenseNumber: req.body.licenseNumber
        };
        break;

      case 'admin':
        // admin → only basic fields
        break;

      default:
        break;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: '✅ Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    next(error);
  }
};

/**
 * UPLOAD AVATAR
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarPath },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Avatar uploaded',
      data: { avatar: user.avatar }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * CHANGE PASSWORD
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '✅ Password changed successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getPublicProfile,
  updateProfile,
  uploadAvatar,
  changePassword
};