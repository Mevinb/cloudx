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

    // Hash password
    const hashedPassword = await bcrypt.hash('mevin123', 12);

    // Create account
    const user = await User.create({
      name: 'Mevin Benty',
      email: 'mevinbenty507@gmail.com',
      password: hashedPassword,
      role: 'student',
      batch: '2024-2025',
      skills: ['Cloud Computing', 'Web Development'],
      bio: 'CloudX Club Member',
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
