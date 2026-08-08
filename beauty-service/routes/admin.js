const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Artist = require('../models/Artist');
const Order = require('../models/Order');

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// POST /api/admin/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check credentials against environment variables
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // For demo purposes, using simple password check
    // In production, use bcrypt.compare with hashed password
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: 'admin', email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login error',
      error: error.message
    });
  }
});

// GET /api/admin/dashboard - Get dashboard stats
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    const totalArtists = await Artist.countDocuments();
    const verifiedArtists = await Artist.countDocuments({ isVerified: true });
    const fakeProfiles = await Artist.countDocuments({ isFake: true });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ paymentStatus: 'paid' });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalArtists,
        verifiedArtists,
        fakeProfiles,
        pendingOrders,
        totalOrders,
        paidOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard',
      error: error.message
    });
  }
});

// GET /api/admin/artists - Get all artists (including fake)
router.get('/artists', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, isFake, isVerified } = req.query;
    
    const query = {};
    if (isFake !== undefined) query.isFake = isFake === 'true';
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const artists = await Artist.find(query)
      .select('-__v')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Artist.countDocuments(query);

    res.json({
      success: true,
      data: artists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching artists',
      error: error.message
    });
  }
});

// DELETE /api/admin/artists/:id - Delete fake profile
router.delete('/artists/:id', verifyAdmin, async (req, res) => {
  try {
    const artist = await Artist.findByIdAndDelete(req.params.id);

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    res.json({
      success: true,
      message: 'Artist deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting artist',
      error: error.message
    });
  }
});

// PUT /api/admin/artists/:id/mark-fake - Mark artist as fake
router.put('/artists/:id/mark-fake', verifyAdmin, async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { isFake: true, updatedAt: Date.now() },
      { new: true }
    );

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    res.json({
      success: true,
      message: 'Artist marked as fake',
      data: artist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking artist as fake',
      error: error.message
    });
  }
});

// PUT /api/admin/artists/:id/verify - Verify artist
router.put('/artists/:id/verify', verifyAdmin, async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, updatedAt: Date.now() },
      { new: true }
    );

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    res.json({
      success: true,
      message: 'Artist verified successfully',
      data: artist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying artist',
      error: error.message
    });
  }
});

// GET /api/admin/orders - Get all orders
router.get('/orders', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, paymentStatus, status } = req.query;
    
    const query = {};
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(query)
      .populate('artist', 'name phone city')
      .select('-__v')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// GET /api/admin/orders/:id - Get single order details
router.get('/orders/:id', verifyAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('artist', 'name phone email address city')
      .select('-__v');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// PUT /api/admin/orders/:id/status - Update order status
router.put('/orders/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('artist', 'name phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// GET /api/admin/payments - Get payment details
router.get('/payments', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, paymentStatus } = req.query;
    
    const query = { paymentStatus: { $in: ['paid', 'pending'] } };
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const payments = await Order.find(query)
      .populate('artist', 'name city')
      .select('orderId customer totalAmount paymentStatus paymentMethod transactionId createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
});

module.exports = router;
