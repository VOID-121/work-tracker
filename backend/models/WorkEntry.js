const mongoose = require('mongoose');

const workEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['Development', 'Meeting', 'Research', 'Documentation', 'Testing', 'Planning', 'Other'],
    default: 'Other'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
    default: 'Not Started'
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  isImportant: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better performance
workEntrySchema.index({ user: 1, date: -1 });
workEntrySchema.index({ user: 1, category: 1 });
workEntrySchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('WorkEntry', workEntrySchema);
