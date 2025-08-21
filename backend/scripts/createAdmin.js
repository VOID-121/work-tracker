const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/work-tracker';

async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed by the model
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        department: 'IT',
        position: 'System Administrator'
      }
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

    // Create demo user
    const demoUser = new User({
      username: 'demo_user',
      email: 'user@example.com',
      password: 'user123', // Will be hashed by the model
      role: 'user',
      profile: {
        firstName: 'Demo',
        lastName: 'User',
        department: 'Development',
        position: 'Software Developer'
      }
    });

    await demoUser.save();
    console.log('Demo user created successfully');
    console.log('Email: user@example.com');
    console.log('Password: user123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
