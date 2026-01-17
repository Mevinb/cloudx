/**
 * Update Test Account Passwords
 * Updates all existing accounts to use password: password123
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { User } = require('./src/models');

const updatePasswords = async () => {
  try {
    console.log('🔐 Updating all user passwords...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Update ALL users
    const result = await User.updateMany(
      {},
      { $set: { password: hashedPassword } }
    );

    console.log(`✅ Updated ${result.modifiedCount} user passwords\n`);
    console.log('🔐 All users now have password: password123\n');

  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

updatePasswords();
