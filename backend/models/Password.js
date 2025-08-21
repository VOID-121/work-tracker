const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  website: {
    type: String,
    trim: true,
    maxlength: 200
  },
  username: {
    type: String,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    trim: true,
    maxlength: 100
  },
  password: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Social Media', 'Banking', 'Work', 'Entertainment', 'Shopping', 'Email', 'Gaming', 'Other'],
    default: 'Other'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  strength: {
    type: String,
    enum: ['Weak', 'Medium', 'Strong', 'Very Strong'],
    default: 'Medium'
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encryption key (in production, this should be stored securely)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const ALGORITHM = 'aes-256-cbc';

// Encrypt password before saving
passwordSchema.pre('save', function(next) {
  if (this.isModified('password') && !this.password.includes(':')) {
    this.password = encryptPassword(this.password);
  }
  next();
});

// Virtual for decrypted password
passwordSchema.virtual('decryptedPassword').get(function() {
  try {
    // Return the original password if it's not encrypted (no colon separator)
    if (!this.password.includes(':')) {
      return this.password;
    }
    return decryptPassword(this.password);
  } catch (error) {
    console.error('Decryption error:', error);
    // Return a safe fallback instead of error text
    return '••••••••';
  }
});

// Ensure virtual fields are serialized
passwordSchema.set('toJSON', { virtuals: true });
passwordSchema.set('toObject', { virtuals: true });

// Encryption function
function encryptPassword(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Decryption function
function decryptPassword(text) {
  if (!text || !text.includes(':')) {
    return text; // Return as-is if not encrypted
  }
  
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Password strength checker
passwordSchema.methods.checkPasswordStrength = function() {
  const password = this.decryptedPassword;
  let score = 0;
  
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 2) return 'Weak';
  if (score <= 3) return 'Medium';
  if (score <= 4) return 'Strong';
  return 'Very Strong';
};

module.exports = mongoose.model('Password', passwordSchema);
