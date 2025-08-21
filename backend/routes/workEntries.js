const express = require('express');
const { body, validationResult, query } = require('express-validator');
const WorkEntry = require('../models/WorkEntry');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/work-entries
// @desc    Get all work entries for current user
// @access  Private
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(['Development', 'Meeting', 'Research', 'Documentation', 'Testing', 'Planning', 'Other']),
  query('status').optional().isIn(['Not Started', 'In Progress', 'Completed', 'On Hold']),
  query('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
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
    const filter = { user: req.user._id };
    
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.isImportant !== undefined) filter.isImportant = req.query.isImportant === 'true';

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    // Search in title and description
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const workEntries = await WorkEntry.find(filter)
      .sort({ date: -1, createdAt: -1 })
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
    console.error('Fetch work entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/work-entries/:id
// @desc    Get single work entry
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const workEntry = await WorkEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!workEntry) {
      return res.status(404).json({ message: 'Work entry not found' });
    }

    res.json(workEntry);
  } catch (error) {
    console.error('Fetch work entry error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid work entry ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/work-entries
// @desc    Create new work entry
// @access  Private
router.post('/', [
  auth,
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be 1-200 characters long'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be 1-1000 characters long'),
  body('category')
    .optional()
    .isIn(['Development', 'Meeting', 'Research', 'Documentation', 'Testing', 'Planning', 'Other']),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('status')
    .optional()
    .isIn(['Not Started', 'In Progress', 'Completed', 'On Hold']),
  body('date')
    .optional()
    .isISO8601(),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 }),
  body('tags')
    .optional()
    .isArray(),
  body('isImportant')
    .optional()
    .isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const workEntryData = {
      ...req.body,
      user: req.user._id
    };

    const workEntry = new WorkEntry(workEntryData);
    await workEntry.save();

    res.status(201).json({
      message: 'Work entry created successfully',
      workEntry
    });
  } catch (error) {
    console.error('Create work entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/work-entries/:id
// @desc    Update work entry
// @access  Private
router.put('/:id', [
  auth,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 }),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 }),
  body('category')
    .optional()
    .isIn(['Development', 'Meeting', 'Research', 'Documentation', 'Testing', 'Planning', 'Other']),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('status')
    .optional()
    .isIn(['Not Started', 'In Progress', 'Completed', 'On Hold']),
  body('date')
    .optional()
    .isISO8601(),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 }),
  body('tags')
    .optional()
    .isArray(),
  body('isImportant')
    .optional()
    .isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const workEntry = await WorkEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!workEntry) {
      return res.status(404).json({ message: 'Work entry not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        workEntry[key] = req.body[key];
      }
    });

    await workEntry.save();

    res.json({
      message: 'Work entry updated successfully',
      workEntry
    });
  } catch (error) {
    console.error('Update work entry error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid work entry ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/work-entries/:id
// @desc    Delete work entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const workEntry = await WorkEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!workEntry) {
      return res.status(404).json({ message: 'Work entry not found' });
    }

    res.json({ message: 'Work entry deleted successfully' });
  } catch (error) {
    console.error('Delete work entry error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid work entry ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/work-entries/stats/summary
// @desc    Get work entries statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get counts by status
    const statusStats = await WorkEntry.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get counts by category
    const categoryStats = await WorkEntry.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get total time spent
    const timeStats = await WorkEntry.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalTime: { $sum: '$timeSpent' } } }
    ]);

    // Get recent entries count (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentCount = await WorkEntry.countDocuments({
      user: userId,
      createdAt: { $gte: weekAgo }
    });

    res.json({
      statusStats,
      categoryStats,
      totalTimeSpent: timeStats[0]?.totalTime || 0,
      recentEntriesCount: recentCount
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
