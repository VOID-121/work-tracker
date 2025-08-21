const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Note = require('../models/Note');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notes
// @desc    Get all notes for current user
// @access  Private
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(['Personal', 'Work', 'Ideas', 'Reminders', 'Meeting Notes', 'Other']),
  query('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  query('color').optional().isIn(['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'])
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
    const filter = { user: req.user._id, isArchived: false };
    
    if (req.query.category) filter.category = req.query.category;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.color) filter.color = req.query.color;
    if (req.query.isImportant !== undefined) filter.isImportant = req.query.isImportant === 'true';
    if (req.query.isPinned !== undefined) filter.isPinned = req.query.isPinned === 'true';

    // Search in title and content
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Sort: pinned first, then by creation date
    const sortOptions = {};
    if (req.query.sortBy === 'title') {
      sortOptions.title = 1;
    } else if (req.query.sortBy === 'priority') {
      sortOptions.priority = -1;
    } else {
      sortOptions.isPinned = -1;
      sortOptions.createdAt = -1;
    }

    const notes = await Note.find(filter)
      .sort(sortOptions)
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
    console.error('Fetch notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notes/archived
// @desc    Get archived notes
// @access  Private
router.get('/archived', auth, async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user._id,
      isArchived: true
    }).sort({ updatedAt: -1 });

    res.json({ notes });
  } catch (error) {
    console.error('Fetch archived notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notes/:id
// @desc    Get single note
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Fetch note error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notes
// @desc    Create new note
// @access  Private
router.post('/', [
  auth,
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be 1-200 characters long'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be 1-5000 characters long'),
  body('category')
    .optional()
    .isIn(['Personal', 'Work', 'Ideas', 'Reminders', 'Meeting Notes', 'Other']),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical']),
  body('color')
    .optional()
    .isIn(['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink']),
  body('tags')
    .optional()
    .isArray(),
  body('isImportant')
    .optional()
    .isBoolean(),
  body('isPinned')
    .optional()
    .isBoolean(),
  body('reminderDate')
    .optional()
    .isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const noteData = {
      ...req.body,
      user: req.user._id
    };

    const note = new Note(noteData);
    await note.save();

    res.status(201).json({
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update note
// @access  Private
router.put('/:id', [
  auth,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 }),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 }),
  body('category')
    .optional()
    .isIn(['Personal', 'Work', 'Ideas', 'Reminders', 'Meeting Notes', 'Other']),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical']),
  body('color')
    .optional()
    .isIn(['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink']),
  body('tags')
    .optional()
    .isArray(),
  body('isImportant')
    .optional()
    .isBoolean(),
  body('isPinned')
    .optional()
    .isBoolean(),
  body('reminderDate')
    .optional()
    .isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        note[key] = req.body[key];
      }
    });

    await note.save();

    res.json({
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Update note error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notes/:id/archive
// @desc    Archive/Unarchive note
// @access  Private
router.put('/:id/archive', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isArchived = !note.isArchived;
    await note.save();

    res.json({
      message: `Note ${note.isArchived ? 'archived' : 'unarchived'} successfully`,
      note
    });
  } catch (error) {
    console.error('Archive note error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notes/:id/pin
// @desc    Pin/Unpin note
// @access  Private
router.put('/:id/pin', auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.json({
      message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
      note
    });
  } catch (error) {
    console.error('Pin note error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete note
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notes/stats/summary
// @desc    Get notes statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get counts by category
    const categoryStats = await Note.aggregate([
      { $match: { user: userId, isArchived: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get counts by priority
    const priorityStats = await Note.aggregate([
      { $match: { user: userId, isArchived: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Get total counts
    const totalNotes = await Note.countDocuments({ user: userId, isArchived: false });
    const pinnedNotes = await Note.countDocuments({ user: userId, isPinned: true, isArchived: false });
    const importantNotes = await Note.countDocuments({ user: userId, isImportant: true, isArchived: false });
    const archivedNotes = await Note.countDocuments({ user: userId, isArchived: true });

    res.json({
      categoryStats,
      priorityStats,
      totalNotes,
      pinnedNotes,
      importantNotes,
      archivedNotes
    });
  } catch (error) {
    console.error('Notes stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
