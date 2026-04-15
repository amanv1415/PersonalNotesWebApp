const express = require('express');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    // Validate against environment credentials
    if (
      username !== process.env.AUTH_USERNAME ||
      password !== process.env.AUTH_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { username: process.env.AUTH_USERNAME },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { username: process.env.AUTH_USERNAME },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
});

// GET /api/auth/verify - Verify token is still valid
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: { username: req.user.username },
  });
});

module.exports = router;
