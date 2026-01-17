/**
 * Clear Database Script
 * Removes all sample/test data while keeping essential test accounts
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const {
  User,
  Session,
  Attendance,
  Agenda,
  Content,
  Assignment,
  Submission,
  Announcement,
  Video
} = require('./src/models');

const clearDatabase = async () => {
  try {
    console.log('🗑️  Starting database cleanup...\n');

    // Connect to database
    await connectDB();

    // Essential accounts to keep (admin, teacher, student)
    const essentialEmails = [
      'admin@college.edu',
      'teacher@college.edu',
      'student@college.edu'
    ];

    // Delete all sample data except essential test accounts
    console.log('📋 Clearing collections...\n');

    // Clear all non-essential users
    const deletedUsers = await User.deleteMany({ 
      email: { $nin: essentialEmails } 
    });
    console.log(`✅ Removed ${deletedUsers.deletedCount} non-essential users`);

    // Clear all sessions
    const deletedSessions = await Session.deleteMany({});
    console.log(`✅ Removed ${deletedSessions.deletedCount} sessions`);

    // Clear all attendance records
    const deletedAttendance = await Attendance.deleteMany({});
    console.log(`✅ Removed ${deletedAttendance.deletedCount} attendance records`);

    // Clear all agendas
    const deletedAgendas = await Agenda.deleteMany({});
    console.log(`✅ Removed ${deletedAgendas.deletedCount} agendas`);

    // Clear all content
    const deletedContent = await Content.deleteMany({});
    console.log(`✅ Removed ${deletedContent.deletedCount} content items`);

    // Clear all assignments
    const deletedAssignments = await Assignment.deleteMany({});
    console.log(`✅ Removed ${deletedAssignments.deletedCount} assignments`);

    // Clear all submissions
    const deletedSubmissions = await Submission.deleteMany({});
    console.log(`✅ Removed ${deletedSubmissions.deletedCount} submissions`);

    // Clear all announcements
    const deletedAnnouncements = await Announcement.deleteMany({});
    console.log(`✅ Removed ${deletedAnnouncements.deletedCount} announcements`);

    // Clear all videos
    if (Video) {
      const deletedVideos = await Video.deleteMany({});
      console.log(`✅ Removed ${deletedVideos.deletedCount} videos`);
    }

    // Show remaining users
    console.log('\n📊 Remaining test accounts:');
    const remainingUsers = await User.find({ email: { $in: essentialEmails } })
      .select('name email role');
    
    remainingUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log('\n✨ Database cleanup completed successfully!');
    console.log('📝 Test accounts retained for login testing.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

// Run the cleanup
clearDatabase();
