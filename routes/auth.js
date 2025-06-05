const router = require('express').Router();
const User = require('../modals/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        // 409 Conflict for existing user
        status: 'Error',
        code: 409,
        message: 'User already exists',
      });
    }

    // Hash password and save user
    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPwd });
    await newUser.save();

    return res.status(201).json({
      status: 'Success',
      code: 201,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 'Error',
      code: 500,
      message: 'Internal server error',
      error: err.message,
    });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        // 401 Unauthorized for invalid login
        status: 'Error',
        code: 401,
        message: 'Email not registered',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'Error',
        code: 401,
        message: 'Incorrect password',
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(200).json({
      status: 'Success',
      code: 200,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 'Error',
      code: 500,
      message: 'Internal server error',
      error: err.message,
    });
  }
});

module.exports = router;
