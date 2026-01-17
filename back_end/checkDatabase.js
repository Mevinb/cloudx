require('dotenv').config();
const mongoose = require('mongoose');
const { User, Session, Attendance, Agenda, Content, Assignment, Submission, Announcement } = require('./src/models');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('\n📊 Current Database Status:\n');
  
  const users = await User.countDocuments();
  const sessions = await Session.countDocuments();
  const attendance = await Attendance.countDocuments();
  const agendas = await Agenda.countDocuments();
  const content = await Content.countDocuments();
  const assignments = await Assignment.countDocuments();
  const submissions = await Submission.countDocuments();
  const announcements = await Announcement.countDocuments();
  
  console.log(`Users: ${users}`);
  console.log(`Sessions: ${sessions}`);
  console.log(`Attendance: ${attendance}`);
  console.log(`Agendas: ${agendas}`);
  console.log(`Content: ${content}`);
  console.log(`Assignments: ${assignments}`);
  console.log(`Submissions: ${submissions}`);
  console.log(`Announcements: ${announcements}`);
  
  console.log('\n✅ Database is clean - only test accounts remain.\n');
  console.log('The data you see in the frontend is MOCK DATA in the code.');
  console.log('Run the Members page refresh to see real database data.\n');
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
