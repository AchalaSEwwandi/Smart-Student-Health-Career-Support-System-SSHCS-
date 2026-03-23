const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ['student', 'doctor', 'shop_owner', 'delivery_person', 'admin'],
      default: 'student',
    },

    phone: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    performanceScore: {
      type: Number,
      default: 0,
    },

    // ── Student-specific fields ──
    studentId: { type: String },
    year: { type: Number, min: 1, max: 5 },
    semester: { type: Number, min: 1, max: 2 },
    faculty: { type: String },

    // ───────── DOCTOR ─────────
    licenseNumber: { type: String },
    availableSlots: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],

    // ───────── SHOP OWNER ─────────
    shopName: { type: String },
    shopType: {
      type: String,
      enum: ['pharmacy', 'grocery'],
    },
    shopAddress: { type: String },

    // ───────── DELIVERY ─────────
    vehicleType: {
      type: String,
      enum: ['bike', 'car', 'walk'],
    },
    currentLocation: { type: String },
  },
  {
    timestamps: true,
  }
);


// 🔐 HASH PASSWORD
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


// 🔍 COMPARE PASSWORD
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};


// ❗ REMOVE SENSITIVE DATA WHEN SENDING RESPONSE
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);