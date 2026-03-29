const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { getProfile, updateProfile, uploadAvatar, changePassword } = require('../controllers/userController');
const verifyToken = require('../middleware/auth');

// Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_PATH || 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
    }
  },
});

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.post('/profile/avatar', verifyToken, upload.single('avatar'), uploadAvatar);
router.put('/profile/password', verifyToken, changePassword);

module.exports = router;
