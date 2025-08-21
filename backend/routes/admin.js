const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const WorkEntry = require('../models/WorkEntry');
const Note = require('../models/Note');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Get work entries statistics
    const totalWorkEntries = await WorkEntry.countDocuments();
    const completedWorkEntries = await WorkEntry.countDocuments({ status: 'Completed' });
    const inProgressWorkEntries = await WorkEntry.countDocuments({ status: 'In Progress' });

    // Get notes statistics
    const totalNotes = await Note.countDocuments();
    const importantNotes = await Note.countDocuments({ isImportant: true });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentWorkEntries = await WorkEntry.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentNotes = await Note.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Get work entries by category for the last 30 days
    const workEntriesByCategory = await WorkEntry.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get most active users (by work entries count)
    const mostActiveUsers = await WorkEntry.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 1, count: 1, username: '$user.username', email: '$user.email' } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      userStats: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        recent: recentUsers
      },
      workEntryStats: {
        total: totalWorkEntries,
        completed: completedWorkEntries,
        inProgress: inProgressWorkEntries,
        recent: recentWorkEntries,
        byCategory: workEntriesByCategory
      },
      noteStats: {
        total: totalNotes,
        important: importantNotes,
        recent: recentNotes
      },
      mostActiveUsers
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Admin
router.get('/users', [
  adminAuth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['user', 'admin']),
  query('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    // Search in username and email
    if (req.query.search) {
      filter.$or = [
        { username: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { 'profile.firstName': { $regex: req.query.search, $options: 'i' } },
        { 'profile.lastName': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user details
// @access  Admin
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's work entries count
    const workEntriesCount = await WorkEntry.countDocuments({ user: user._id });
    
    // Get user's notes count
    const notesCount = await Note.countDocuments({ user: user._id });

    // Get recent activity
    const recentWorkEntries = await WorkEntry.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category status createdAt');

    const recentNotes = await Note.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category isImportant createdAt');

    res.json({
      user,
      stats: {
        workEntries: workEntriesCount,
        notes: notesCount
      },
      recentActivity: {
        workEntries: recentWorkEntries,
        notes: recentNotes
      }
    });
  } catch (error) {
    console.error('Admin get user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin can change role and active status)
// @access  Admin
router.put('/users/:id', [
  adminAuth,
  body('role').optional().isIn(['user', 'admin']),
  body('isActive').optional().isBoolean(),
  body('profile.firstName').optional().trim().isLength({ max: 50 }),
  body('profile.lastName').optional().trim().isLength({ max: 50 }),
  body('profile.department').optional().trim().isLength({ max: 100 }),
  body('profile.position').optional().trim().isLength({ max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString() && req.body.isActive === false) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    // Prevent admin from changing their own role to user if they're the only admin
    if (req.params.id === req.user._id.toString() && req.body.role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot change role. At least one admin must remain.' });
      }
    }

    // Update fields
    if (req.body.role !== undefined) user.role = req.body.role;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
    
    if (req.body.profile) {
      Object.keys(req.body.profile).forEach(key => {
        if (req.body.profile[key] !== undefined) {
          user.profile[key] = req.body.profile[key];
        }
      });
    }

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin only)
// @access  Admin
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Check if this is the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin account' });
      }
    }

    // Delete user's work entries and notes
    await WorkEntry.deleteMany({ user: user._id });
    await Note.deleteMany({ user: user._id });
    
    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/work-entries
// @desc    Get all work entries (admin view)
// @access  Admin
router.get('/work-entries', [
  adminAuth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('userId').optional().isMongoId(),
  query('category').optional().isIn(['Development', 'Meeting', 'Research', 'Documentation', 'Testing', 'Planning', 'Other']),
  query('status').optional().isIn(['Not Started', 'In Progress', 'Completed', 'On Hold'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.userId) filter.user = req.query.userId;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;

    const workEntries = await WorkEntry.find(filter)
      .populate('user', 'username email profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await WorkEntry.countDocuments(filter);

    res.json({
      workEntries,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Admin get work entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/notes
// @desc    Get all notes (admin view)
// @access  Admin
router.get('/notes', [
  adminAuth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('userId').optional().isMongoId(),
  query('category').optional().isIn(['Personal', 'Work', 'Ideas', 'Reminders', 'Meeting Notes', 'Other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.userId) filter.user = req.query.userId;
    if (req.query.category) filter.category = req.query.category;

    const notes = await Note.find(filter)
      .populate('user', 'username email profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments(filter);

    res.json({
      notes,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Admin get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
