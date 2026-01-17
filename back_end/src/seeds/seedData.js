/**
 * Database Seed Script
 * Populates database with sample data for development/testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/database');
const {
  User,
  Session,
  Attendance,
  Agenda,
  Content,
  Assignment,
  Submission,
  Announcement
} = require('../models');

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@college.edu',
    password: 'password123',
    role: 'admin',
    skills: ['System Administration', 'Cloud Infrastructure', 'Security']
  },
  {
    name: 'Prof. Sarah Johnson',
    email: 'teacher@college.edu',
    password: 'password123',
    role: 'teacher',
    skills: ['Cloud Architecture', 'AWS', 'Teaching', 'Research']
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@college.edu',
    password: 'password123',
    role: 'teacher',
    skills: ['Serverless', 'Microservices', 'AWS', 'Azure']
  },
  {
    name: 'Alice Johnson',
    email: 'student@college.edu',
    password: 'password123',
    role: 'student',
    batch: '2024',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Python']
  },
  {
    name: 'Bob Smith',
    email: 'bob@college.edu',
    password: 'password123',
    role: 'student',
    batch: '2024',
    skills: ['Azure', 'CI/CD', 'Terraform', 'JavaScript']
  },
  {
    name: 'Charlie Davis',
    email: 'charlie@college.edu',
    password: 'password123',
    role: 'student',
    batch: '2025',
    skills: ['Google Cloud', 'Node.js', 'MongoDB']
  },
  {
    name: 'Diana Wilson',
    email: 'diana@college.edu',
    password: 'password123',
    role: 'student',
    batch: '2024',
    skills: ['AWS', 'React', 'DevOps', 'Docker']
  },
  {
    name: 'Ethan Brown',
    email: 'ethan@college.edu',
    password: 'password123',
    role: 'student',
    batch: '2024',
    skills: ['Python', 'Machine Learning', 'AWS SageMaker']
  }
];

const sessions = [
  {
    title: 'Introduction to Cloud Computing',
    description: 'Overview of cloud computing concepts, service models, and major cloud providers.',
    date: new Date('2026-01-15'),
    startTime: '14:00',
    endTime: '16:00',
    location: 'Room 101, CS Building',
    type: 'lecture'
  },
  {
    title: 'AWS Fundamentals',
    description: 'Getting started with AWS services including EC2, S3, and RDS.',
    date: new Date('2026-01-12'),
    startTime: '15:00',
    endTime: '17:00',
    location: 'Lab 301, CS Building',
    type: 'workshop'
  },
  {
    title: 'Docker Containerization',
    description: 'Learn how to build, deploy, and manage Docker containers.',
    date: new Date('2026-01-08'),
    startTime: '14:00',
    endTime: '16:00',
    location: 'Room 205, Tech Hub',
    type: 'workshop'
  },
  {
    title: 'Kubernetes Orchestration Workshop',
    description: 'Hands-on workshop covering Kubernetes deployment, scaling, and management strategies.',
    date: new Date('2026-01-20'),
    startTime: '14:00',
    endTime: '16:00',
    location: 'Lab 301, CS Building',
    type: 'workshop'
  }
];

const agendas = [
  {
    date: new Date('2026-01-20'),
    topic: 'Kubernetes Orchestration Workshop',
    description: 'Hands-on workshop covering Kubernetes deployment, scaling, and management strategies.',
    speaker: 'Prof. Sarah Johnson',
    location: 'Lab 301, CS Building',
    startTime: '14:00',
    endTime: '16:00',
    resources: [
      { title: 'Slides', type: 'slides', url: '#' },
      { title: 'Documentation', type: 'link', url: '#' }
    ],
    tags: ['kubernetes', 'containers', 'orchestration']
  },
  {
    date: new Date('2026-01-22'),
    topic: 'Serverless Architecture Deep Dive',
    description: 'Explore AWS Lambda, Azure Functions, and best practices for serverless applications.',
    speaker: 'Dr. Michael Chen',
    location: 'Room 205, Tech Hub',
    startTime: '15:00',
    endTime: '17:00',
    resources: [
      { title: 'Code Examples', type: 'link', url: '#' },
      { title: 'AWS Free Tier Guide', type: 'pdf', url: '#' }
    ],
    tags: ['serverless', 'aws', 'azure']
  },
  {
    date: new Date('2026-01-25'),
    topic: 'Cloud Security Fundamentals',
    description: 'Understanding security best practices, IAM, encryption, and compliance in cloud environments.',
    speaker: 'Emily Rodriguez',
    location: 'Auditorium A',
    startTime: '14:30',
    endTime: '16:30',
    resources: [
      { title: 'Security Checklist', type: 'pdf', url: '#' },
      { title: 'Case Studies', type: 'document', url: '#' }
    ],
    tags: ['security', 'compliance', 'iam']
  }
];

const contents = [
  {
    title: 'Introduction to AWS Cloud',
    description: 'Comprehensive introduction to Amazon Web Services and core cloud concepts.',
    type: 'video',
    topic: 'AWS',
    duration: '45 min',
    embedUrl: 'https://www.youtube.com/embed/example1',
    tags: ['aws', 'cloud', 'beginner']
  },
  {
    title: 'Docker Complete Guide',
    description: 'Complete guide to containerization with Docker including best practices.',
    type: 'pdf',
    topic: 'Docker',
    pageCount: 42,
    url: '#',
    tags: ['docker', 'containers', 'devops']
  },
  {
    title: 'Kubernetes Architecture',
    description: 'Deep dive into Kubernetes architecture, components, and orchestration.',
    type: 'slides',
    topic: 'Kubernetes',
    slideCount: 68,
    url: '#',
    tags: ['kubernetes', 'orchestration', 'containers']
  },
  {
    title: 'Serverless Computing Tutorial',
    description: 'Learn serverless computing with AWS Lambda and Azure Functions.',
    type: 'video',
    topic: 'Serverless',
    duration: '1h 15min',
    embedUrl: 'https://www.youtube.com/embed/example2',
    tags: ['serverless', 'lambda', 'functions']
  },
  {
    title: 'Cloud Security Best Practices',
    description: 'Essential security practices for cloud infrastructure and applications.',
    type: 'pdf',
    topic: 'Security',
    pageCount: 35,
    url: '#',
    tags: ['security', 'best-practices', 'compliance']
  }
];

const assignments = [
  {
    title: 'Docker Containerization Lab',
    description: 'Create a multi-container application using Docker Compose.',
    instructions: 'Include a web server, database, and caching layer. Submit your docker-compose.yml and Dockerfile(s).',
    dueDate: new Date('2026-01-18'),
    points: 100,
    topic: 'Docker',
    submissionType: 'file'
  },
  {
    title: 'AWS Cloud Architecture Design',
    description: 'Design a scalable, highly available web application architecture using AWS services.',
    instructions: 'Create an architecture diagram and documentation explaining your design choices.',
    dueDate: new Date('2026-01-22'),
    points: 150,
    topic: 'AWS',
    submissionType: 'any'
  },
  {
    title: 'Kubernetes Deployment',
    description: 'Deploy a microservices application on Kubernetes cluster with proper configuration.',
    instructions: 'Submit your YAML manifests and a brief explanation of your deployment strategy.',
    dueDate: new Date('2026-01-25'),
    points: 120,
    topic: 'Kubernetes',
    submissionType: 'file'
  }
];

const announcements = [
  {
    title: 'Workshop on Serverless Computing - This Saturday!',
    content: 'Join us this Saturday for an intensive workshop on serverless computing with AWS Lambda and Azure Functions. We\'ll cover architecture patterns, best practices, and hands-on deployment. Limited seats available, register now!',
    priority: 'high',
    category: 'Event',
    isPinned: true
  },
  {
    title: 'New Learning Resources Added',
    content: 'We\'ve added new video tutorials and documentation for Kubernetes, Docker Swarm, and container orchestration. Check out the Learning Content section to access these materials.',
    priority: 'normal',
    category: 'Resources'
  },
  {
    title: 'Assignment Deadline Extended',
    content: 'The deadline for the Docker Containerization Lab has been extended to January 20th. Make sure to submit your work before the new deadline to avoid late penalties.',
    priority: 'medium',
    category: 'Assignment'
  },
  {
    title: 'AWS Free Credits Available',
    content: 'Good news! We have AWS Educate credits available for all club members. Each member will receive $100 in AWS credits for hands-on practice. Contact the administrators to claim your credits.',
    priority: 'high',
    category: 'Resources',
    isPinned: true
  }
];

async function seedDatabase() {
  try {
    await connectDB();
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Session.deleteMany({}),
      Attendance.deleteMany({}),
      Agenda.deleteMany({}),
      Content.deleteMany({}),
      Assignment.deleteMany({}),
      Submission.deleteMany({}),
      Announcement.deleteMany({})
    ]);

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.create(users);
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const teacherUser = createdUsers.find(u => u.role === 'teacher');
    const students = createdUsers.filter(u => u.role === 'student');

    // Create sessions
    console.log('📅 Creating sessions...');
    const createdSessions = await Session.create(
      sessions.map(s => ({ ...s, createdBy: teacherUser._id }))
    );

    // Create attendance records
    console.log('✅ Creating attendance records...');
    const attendanceRecords = [];
    for (const session of createdSessions) {
      for (const student of students) {
        const status = Math.random() > 0.2 ? 'present' : 'absent';
        attendanceRecords.push({
          user: student._id,
          session: session._id,
          status,
          checkInTime: status === 'present' ? new Date() : null,
          markedBy: teacherUser._id,
          method: 'manual'
        });
      }
    }
    await Attendance.create(attendanceRecords);

    // Create agendas
    console.log('📋 Creating agendas...');
    await Agenda.create(
      agendas.map(a => ({ ...a, createdBy: teacherUser._id }))
    );

    // Create content
    console.log('📚 Creating content...');
    await Content.create(
      contents.map(c => ({ ...c, uploadedBy: teacherUser._id }))
    );

    // Create assignments
    console.log('📝 Creating assignments...');
    const createdAssignments = await Assignment.create(
      assignments.map(a => ({ ...a, createdBy: teacherUser._id }))
    );

    // Create some submissions
    console.log('📤 Creating submissions...');
    const submissions = [];
    for (const assignment of createdAssignments.slice(0, 2)) {
      for (const student of students.slice(0, 3)) {
        submissions.push({
          assignment: assignment._id,
          student: student._id,
          content: 'Sample submission content',
          status: Math.random() > 0.5 ? 'graded' : 'submitted',
          score: Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 70 : undefined,
          submittedAt: new Date()
        });
      }
    }
    await Submission.create(submissions);

    // Create announcements
    console.log('📢 Creating announcements...');
    await Announcement.create(
      announcements.map(a => ({ ...a, author: teacherUser._id }))
    );

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ✅ Database seeded successfully!                            ║
║                                                               ║
║   Created:                                                    ║
║   • ${createdUsers.length} users                                              ║
║   • ${createdSessions.length} sessions                                           ║
║   • ${attendanceRecords.length} attendance records                                 ║
║   • ${agendas.length} agendas                                             ║
║   • ${contents.length} content items                                       ║
║   • ${createdAssignments.length} assignments                                         ║
║   • ${submissions.length} submissions                                         ║
║   • ${announcements.length} announcements                                       ║
║                                                               ║
║   Test Credentials:                                           ║
║   Admin:   admin@college.edu / password123                    ║
║   Teacher: teacher@college.edu / password123                  ║
║   Student: student@college.edu / password123                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
