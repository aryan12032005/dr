const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Token expired or invalid' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.is_admin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// Check if user is faculty
const isFaculty = (req, res, next) => {
  if (req.user && req.user.is_faculty) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as faculty' });
  }
};

// Check if user is admin or faculty
const isAdminOrFaculty = (req, res, next) => {
  if (req.user && (req.user.is_admin || req.user.is_faculty)) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized' });
  }
};

// Check if user account is active
const isActive = (req, res, next) => {
  if (req.user && req.user.is_allowed) {
    next();
  } else {
    res.status(403).json({ message: 'Account is disabled' });
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = {
  protect,
  isAdmin,
  isFaculty,
  isAdminOrFaculty,
  isActive,
  generateToken,
  generateRefreshToken
};
