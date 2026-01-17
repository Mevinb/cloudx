/**
 * Update Specific User Password
 * Updates a specific user's password
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { User } = require('./src/models');

const updateUserPassword = async () => {
  try {
    console.log('🔐 Updating user password...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('mevin123', 12);

    // Update specific user (change email if needed)
    const email = 'mevinbenty507@gmail.com';
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    user.password = hashedPassword;
    await user.save();

    console.log(`✅ Updated password for: ${user.name} (${user.email})`);
    console.log(`🔐 New password: mevin123\n`);

  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

updateUserPassword();
