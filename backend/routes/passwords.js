const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Password = require('../models/Password');

const router = express.Router();

// Get all passwords for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { user: req.user.id };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { website: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const passwords = await Password.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Password.countDocuments(query);
    
    res.json({
      passwords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching passwords:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get password statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const totalPasswords = await Password.countDocuments({ user: req.user.id });
    
    const categoryStats = await Password.aggregate([
      { $match: { user: req.user.id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const strengthStats = await Password.aggregate([
      { $match: { user: req.user.id } },
      { $group: { _id: '$strength', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalPasswords,
      categoryStats,
      strengthStats
    });
  } catch (error) {
    console.error('Error fetching password stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single password by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const password = await Password.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!password) {
      return res.status(404).json({ message: 'Password not found' });
    }
    
    res.json(password);
  } catch (error) {
    console.error('Error fetching password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new password
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('website').optional().trim().isLength({ max: 200 }).withMessage('Website must be less than 200 characters'),
  body('username').optional().trim().isLength({ max: 100 }).withMessage('Username must be less than 100 characters'),
  body('email').optional().trim().isLength({ max: 100 }).withMessage('Email must be less than 100 characters'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
  body('category').optional().isIn(['Social Media', 'Banking', 'Work', 'Entertainment', 'Shopping', 'Email', 'Gaming', 'Other']).withMessage('Invalid category'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { title, website, username, email, password, category, notes, tags } = req.body;
    
    const newPassword = new Password({
      user: req.user.id,
      title,
      website,
      username,
      email,
      password,
      category: category || 'Other',
      notes,
      tags: tags || []
    });
    
    // Check password strength
    newPassword.strength = newPassword.checkPasswordStrength();
    
    await newPassword.save();
    
    res.status(201).json(newPassword);
  } catch (error) {
    console.error('Error creating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a password
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be less than 100 characters'),
  body('website').optional().trim().isLength({ max: 200 }).withMessage('Website must be less than 200 characters'),
  body('username').optional().trim().isLength({ max: 100 }).withMessage('Username must be less than 100 characters'),
  body('email').optional().trim().isLength({ max: 100 }).withMessage('Email must be less than 100 characters'),
  body('password').optional().isLength({ min: 1 }).withMessage('Password cannot be empty'),
  body('category').optional().isIn(['Social Media', 'Banking', 'Work', 'Entertainment', 'Shopping', 'Email', 'Gaming', 'Other']).withMessage('Invalid category'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const password = await Password.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!password) {
      return res.status(404).json({ message: 'Password not found' });
    }
    
    const { title, website, username, email, password: newPassword, category, notes, tags } = req.body;
    
    if (title !== undefined) password.title = title;
    if (website !== undefined) password.website = website;
    if (username !== undefined) password.username = username;
    if (email !== undefined) password.email = email;
    if (newPassword !== undefined) password.password = newPassword;
    if (category !== undefined) password.category = category;
    if (notes !== undefined) password.notes = notes;
    if (tags !== undefined) password.tags = tags;
    
    password.lastModified = new Date();
    
    // Check password strength if password was updated
    if (newPassword !== undefined) {
      password.strength = password.checkPasswordStrength();
    }
    
    await password.save();
    
    res.json(password);
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a password
router.delete('/:id', auth, async (req, res) => {
  try {
    const password = await Password.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    
    if (!password) {
      return res.status(404).json({ message: 'Password not found' });
    }
    
    res.json({ message: 'Password deleted successfully' });
  } catch (error) {
    console.error('Error deleting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
