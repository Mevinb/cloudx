/**
 * Create Personal Account
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { User } = require('./src/models');

const createAccount = async () => {
  try {
    console.log('👤 Creating your personal account...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Create account (password will be hashed by the model's pre-save hook)
    const user = await User.create({
      name: 'mevin Benty',
      email: 'botgaming507@gmail.com',
      password: 'mevin123',
      role: 'admin',
      batch: '2024-2025',
      skills: ['Cloud Computing', 'Web Development', 'System Administration'],
      bio: 'CloudX Club Admin',
      isActive: true
    });

    console.log(`✅ Created account:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password: mevin123\n`);

  } catch (error) {
    console.error('❌ Error creating account:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

createAccount();
