const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// User schema matching the User model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  studentId: { type: String },
  profilePicture: { type: String },
  bio: { type: String },
  skills: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const seedUsers = async () => {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Demo users matching the login page hints
    const users = [
      {
        name: 'Demo Student',
        email: 'student@college.edu',
        password: hashedPassword,
        role: 'student',
        studentId: 'STU001',
        bio: 'Computer Science student interested in cloud computing',
        skills: ['JavaScript', 'Python', 'AWS'],
        isActive: true
      },
      {
        name: 'Demo Teacher',
        email: 'teacher@college.edu',
        password: hashedPassword,
        role: 'teacher',
        bio: 'Cloud computing instructor with 10+ years experience',
        skills: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker'],
        isActive: true
      },
      {
        name: 'Demo Admin',
        email: 'admin@college.edu',
        password: hashedPassword,
        role: 'admin',
        bio: 'System administrator for Cloud Computing Club',
        skills: ['System Administration', 'DevOps', 'Security'],
        isActive: true
      },
      // Additional sample students
      {
        name: 'Alice Johnson',
        email: 'alice@college.edu',
        password: hashedPassword,
        role: 'student',
        studentId: 'STU002',
        bio: 'Passionate about serverless architecture',
        skills: ['AWS Lambda', 'Node.js', 'React'],
        isActive: true
      },
      {
        name: 'Bob Smith',
        email: 'bob@college.edu',
        password: hashedPassword,
        role: 'student',
        studentId: 'STU003',
        bio: 'Learning DevOps practices',
        skills: ['Docker', 'CI/CD', 'Linux'],
        isActive: true
      },
      {
        name: 'Carol Williams',
        email: 'carol@college.edu',
        password: hashedPassword,
        role: 'student',
        studentId: 'STU004',
        bio: 'Machine learning enthusiast',
        skills: ['Python', 'TensorFlow', 'AWS SageMaker'],
        isActive: true
      }
    ];

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`\n✅ Created ${createdUsers.length} users:\n`);
    
    createdUsers.forEach(user => {
      console.log(`   📧 ${user.email} (${user.role})`);
    });

    console.log('\n🔐 All passwords are: password123\n');
    console.log('🎉 Database seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📤 Disconnected from MongoDB');
    process.exit(0);
  }
};

seedUsers();
