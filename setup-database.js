#!/usr/bin/env node
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./backend/models/User');

// Get MongoDB URI from environment or command line
const MONGODB_URI = process.env.MONGODB_URI || process.argv[2];

if (!MONGODB_URI) {
  console.error('❌ Please provide MongoDB URI as environment variable or command line argument');
  console.log('Usage: node setup-database.js "mongodb+srv://..."');
  console.log('Or set MONGODB_URI environment variable');
  process.exit(1);
}

async function setupDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB Atlas successfully');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
    } else {
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
      console.log('✅ Admin user created successfully');
      console.log('   📧 Email: admin@example.com');
      console.log('   🔑 Password: admin123');
    }

    // Check if demo user already exists
    const existingDemo = await User.findOne({ email: 'user@example.com' });
    if (existingDemo) {
      console.log('ℹ️  Demo user already exists');
    } else {
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
      console.log('✅ Demo user created successfully');
      console.log('   📧 Email: user@example.com');
      console.log('   🔑 Password: user123');
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\n📋 You can now login with:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User:  user@example.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
