/**
 * Seed Test Data Script
 * Adds realistic test data to the database for application testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import models
const { User, Session, Attendance, Assignment, Submission, Announcement, Agenda, Content } = require('./src/models');

const seedTestData = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Update existing test accounts to use the same password
    console.log('🔧 Updating existing test account passwords...');
    const essentialEmails = ['admin@college.edu', 'student@college.edu', 'teacher@college.edu'];
    await User.updateMany(
      { email: { $in: essentialEmails } },
      { $set: { password: hashedPassword } }
    );
    console.log('✅ Updated 3 existing test accounts\n');

    // 1. CREATE USERS
    console.log('👥 Creating users...');
    
    // 10 Students
    const students = await User.insertMany([
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@college.edu',
        password: hashedPassword,
        role: 'student',
        batch: '2024-2025',
        skills: ['AWS', 'Docker', 'React'],
        bio: 'Passionate about cloud computing and DevOps practices.',
        isActive: true
      },
      {
        name: 'Bob Smith',
        email: 'bob.smith@college.edu',
        password: hashedPassword,
        role: 'student',
        batch: '2024-2025',
        skills: ['Azure', 'Kubernetes', 'Python'],
        bio: 'Interested in cloud architecture and automation.',
        isActive: true
      },
      {
        name: 'Charlie Davis',
        email: 'charlie.davis@college.edu',
        password: hashedPassword,
        role: 'student',
        batch: '2024-2025',
        skills: ['GCP', 'Terraform', 'Node.js'],
        bio: 'Learning infrastructure as code and microservices.',
        isActive: true
      },
      {
        name: 'Diana Wilson',
        email: 'diana.wilson@college.edu',
        password: hashedPassword,
        role: 'student',
        batch: '2024-2025',
        skills: ['AWS', 'Lambda', 'JavaScript'],
        bio: 'Exploring serverless architecture and cloud functions.',
        isActive: true
      },
      {
        name: 'Ethan Brown',
        email: 'ethan.brown@college.edu',
        password: hashedPassword,
        role: 'student',
        batch: '2024-2025',
        skills: ['Docker', 'CI/CD', 'Jenkins'],
        bio: 'Focused on DevOps tools and continuous delivery.',
        isActive: true
      },
      {
        name: 'Fiona Martinez',
        email: 'fiona.martinez@college.edu',
        password: hashedPassword,
        role: 'student',
        batch: '2023-2024',
        skills: ['Kubernetes', 'Helm', 'Monitoring'],
        bio: 'Studying container orchestration and cloud observability.',
        isActive: true
      },
      {
        name: 'George Taylor',
        email: 'george.taylor@college.edu',
        password: hashedPassword,
        role: 'student',
        batch: '2023-2024',
        skills: ['Azure', 'PowerShell', 'Security'],
        bio: 'Interested in cloud security and identity management.',
        isActive: true
      },
      {
        name: 'Hannah Lee',
        email: 'hannah.lee@college.edu',
        password: hashedPassword,
        role: 'student',
        batch: '2023-2024',
        skills: ['AWS', 'S3', 'CloudFront'],
        bio: 'Learning about cloud storage and content delivery.',
        isActive: true
      },
      {
        name: 'Ian Rodriguez',
        email: 'ian.rodriguez@college.edu',
        password: hashedPassword,
        role: 'student',
        batch: '2023-2024',
        skills: ['GCP', 'BigQuery', 'Data Engineering'],
        bio: 'Passionate about cloud data platforms and analytics.',
        isActive: true
      },
      {
        name: 'Julia Thompson',
        email: 'julia.thompson@college.edu',
        password: hashedPassword,
        role: 'student',
        batch: '2024-2025',
        skills: ['Docker', 'Kubernetes', 'Microservices'],
        bio: 'Building cloud-native applications and services.',
        isActive: true
      }
    ]);
    console.log(`✅ Created ${students.length} students`);

    // 1 Additional Teacher
    const teachers = await User.insertMany([
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@college.edu',
        password: hashedPassword,
        role: 'teacher',
        skills: ['Cloud Architecture', 'AWS', 'Security', 'DevOps'],
        bio: 'Cloud computing expert with 10+ years of industry experience.',
        isActive: true
      }
    ]);
    console.log(`✅ Created ${teachers.length} additional teacher`);

    // 2 New Admins
    const admins = await User.insertMany([
      {
        name: 'John Anderson',
        email: 'john.anderson@college.edu',
        password: hashedPassword,
        role: 'admin',
        skills: ['System Administration', 'Cloud Management', 'Leadership'],
        bio: 'Club administrator managing operations and resources.',
        isActive: true
      },
      {
        name: 'Sarah Mitchell',
        email: 'sarah.mitchell@college.edu',
        password: hashedPassword,
        role: 'admin',
        skills: ['Project Management', 'Cloud Strategy', 'Coordination'],
        bio: 'Coordinating club activities and member engagement.',
        isActive: true
      }
    ]);
    console.log(`✅ Created ${admins.length} new admins\n`);

    // 2. CREATE SESSIONS
    console.log('📅 Creating sessions...');
    const sessions = await Session.insertMany([
      {
        title: 'Introduction to Cloud Computing',
        description: 'Overview of cloud computing concepts, service models (IaaS, PaaS, SaaS), and major cloud providers.',
        date: new Date('2026-01-15'),
        startTime: '14:00',
        endTime: '16:00',
        location: 'Room 101, CS Building',
        instructor: teachers[0]._id,
        createdBy: teachers[0]._id,
        type: 'workshop',
        capacity: 50,
        status: 'completed'
      },
      {
        title: 'AWS Fundamentals Workshop',
        description: 'Hands-on workshop covering AWS EC2, S3, RDS, and basic networking concepts.',
        date: new Date('2026-01-12'),
        startTime: '15:00',
        endTime: '17:00',
        location: 'Lab 301, CS Building',
        instructor: teachers[0]._id,
        createdBy: teachers[0]._id,
        type: 'workshop',
        capacity: 50,
        status: 'completed'
      },
      {
        title: 'Docker Containerization',
        description: 'Learn how to build, deploy, and manage Docker containers for cloud applications.',
        date: new Date('2026-01-08'),
        startTime: '14:00',
        endTime: '16:00',
        location: 'Room 205, Tech Hub',
        instructor: teachers[0]._id,
        createdBy: teachers[0]._id,
        type: 'workshop',
        capacity: 50,
        status: 'completed'
      },
      {
        title: 'Kubernetes Orchestration',
        description: 'Deep dive into Kubernetes architecture, deployment, scaling, and management.',
        date: new Date('2026-01-20'),
        startTime: '14:00',
        endTime: '16:00',
        location: 'Lab 301, CS Building',
        instructor: teachers[0]._id,
        createdBy: teachers[0]._id,
        type: 'workshop',
        capacity: 50,
        status: 'upcoming'
      },
      {
        title: 'Serverless Architecture',
        description: 'Explore AWS Lambda, Azure Functions, and serverless application patterns.',
        date: new Date('2026-01-22'),
        startTime: '15:00',
        endTime: '17:00',
        location: 'Room 205, Tech Hub',
        instructor: teachers[0]._id,
        createdBy: teachers[0]._id,
        type: 'lecture',
        capacity: 50,
        status: 'upcoming'
      }
    ]);
    console.log(`✅ Created ${sessions.length} sessions\n`);

    // 3. CREATE ATTENDANCE RECORDS (for past sessions)
    console.log('✔️ Creating attendance records...');
    const attendanceRecords = [];
    const pastSessions = sessions.slice(0, 3); // First 3 sessions are completed

    for (const session of pastSessions) {
      for (const student of students) {
        // Randomly assign present/absent (80% attendance rate)
        const isPresent = Math.random() > 0.2;
        attendanceRecords.push({
          session: session._id,
          user: student._id,
          status: isPresent ? 'present' : 'absent',
          markedBy: teachers[0]._id,
          markedAt: session.date,
          checkInTime: isPresent ? new Date(session.date) : null
        });
      }
    }
    await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Created ${attendanceRecords.length} attendance records\n`);

    // 4. CREATE ASSIGNMENTS
    console.log('📝 Creating assignments...');
    const assignments = await Assignment.insertMany([
      {
        title: 'Docker Containerization Lab',
        description: 'Create a multi-container application using Docker Compose. Include a web server, database, and caching layer. Submit your docker-compose.yml and documentation.',
        instructions: '1. Build a Node.js/Python web application\n2. Add PostgreSQL database\n3. Add Redis cache\n4. Create Docker Compose configuration\n5. Write deployment documentation',
        dueDate: new Date('2026-01-25'),
        totalPoints: 100,
        createdBy: teachers[0]._id,
        attachments: [],
        published: true
      },
      {
        title: 'AWS Cloud Architecture Design',
        description: 'Design a scalable, highly available web application architecture using AWS services. Create an architecture diagram and detailed documentation.',
        instructions: '1. Use AWS services (EC2, RDS, S3, CloudFront, ELB)\n2. Design for high availability\n3. Include security best practices\n4. Document cost estimates\n5. Create architecture diagram',
        dueDate: new Date('2026-01-28'),
        totalPoints: 150,
        createdBy: teachers[0]._id,
        attachments: [],
        published: true
      },
      {
        title: 'Kubernetes Deployment Project',
        description: 'Deploy a microservices application on Kubernetes cluster with proper configuration for scaling, monitoring, and logging.',
        instructions: '1. Create Kubernetes manifests (Deployments, Services, ConfigMaps)\n2. Implement health checks\n3. Configure autoscaling\n4. Add monitoring\n5. Document deployment steps',
        dueDate: new Date('2026-02-05'),
        totalPoints: 120,
        createdBy: teachers[0]._id,
        attachments: [],
        published: true
      }
    ]);
    console.log(`✅ Created ${assignments.length} assignments\n`);

    // 5. CREATE SOME SUBMISSIONS (some students have submitted)
    console.log('📤 Creating assignment submissions...');
    const submissions = [];
    // First 5 students submit first assignment
    for (let i = 0; i < 5; i++) {
      submissions.push({
        assignment: assignments[0]._id,
        student: students[i]._id,
        submittedAt: new Date('2026-01-14'),
        status: 'submitted',
        attachments: [],
        comments: 'Completed the Docker lab assignment.'
      });
    }
    // First 3 students submit second assignment
    for (let i = 0; i < 3; i++) {
      submissions.push({
        assignment: assignments[1]._id,
        student: students[i]._id,
        submittedAt: new Date('2026-01-16'),
        status: 'graded',
        grade: 85 + Math.floor(Math.random() * 15),
        attachments: [],
        comments: 'Submitted AWS architecture design.',
        feedback: 'Great work! Excellent use of AWS services and security considerations.'
      });
    }
    await Submission.insertMany(submissions);
    console.log(`✅ Created ${submissions.length} submissions\n`);

    // 6. CREATE ANNOUNCEMENTS
    console.log('📢 Creating announcements...');
    const announcements = await Announcement.insertMany([
      {
        title: 'Welcome to CloudX Club - Spring 2026!',
        content: 'Welcome to the Spring 2026 semester! We have an exciting lineup of workshops, guest speakers, and hands-on projects. Check the agenda for upcoming sessions.',
        author: admins[0]._id,
        priority: 'high',
        pinned: true,
        published: true,
        category: 'General'
      },
      {
        title: 'Kubernetes Workshop - This Saturday!',
        content: 'Join us this Saturday for an intensive workshop on Kubernetes orchestration. We will cover deployment strategies, scaling, and management best practices. Limited seats available!',
        author: teachers[0]._id,
        priority: 'high',
        pinned: true,
        published: true,
        category: 'Event'
      },
      {
        title: 'New Learning Resources Added',
        content: 'We have added new video tutorials and documentation for Docker, Kubernetes, and serverless computing. Check out the Learning Content section to access these materials.',
        author: teachers[0]._id,
        priority: 'normal',
        pinned: false,
        published: true,
        category: 'Resources'
      },
      {
        title: 'Assignment Deadline Extended',
        content: 'The deadline for the Docker Containerization Lab has been extended to January 25th. Make sure to submit your work before the new deadline.',
        author: teachers[0]._id,
        priority: 'medium',
        pinned: false,
        published: true,
        category: 'Assignment'
      },
      {
        title: 'AWS Free Credits Available',
        content: 'Good news! We have AWS Educate credits available for all club members. Each member will receive $100 in AWS credits for hands-on practice. Contact the administrators to claim your credits.',
        author: admins[1]._id,
        priority: 'high',
        pinned: true,
        published: true,
        category: 'Resources'
      }
    ]);
    console.log(`✅ Created ${announcements.length} announcements\n`);

    // 7. CREATE AGENDAS
    console.log('📆 Creating session agendas...');
    const agendas = await Agenda.insertMany([
      {
        topic: 'Kubernetes Orchestration Workshop',
        description: 'Hands-on workshop covering Kubernetes deployment, scaling, and management strategies. Bring your laptop!',
        date: new Date('2026-01-20'),
        startTime: '14:00',
        endTime: '16:00',
        location: 'Lab 301, CS Building',
        speaker: 'Dr. Emily Rodriguez',
        resources: [
          { title: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs', type: 'link' },
          { title: 'Lab Instructions', url: '/resources/k8s-lab.pdf', type: 'pdf' }
        ],
        createdBy: teachers[0]._id,
        isPublished: true
      },
      {
        topic: 'Serverless Architecture Deep Dive',
        description: 'Explore AWS Lambda, Azure Functions, and best practices for building serverless applications.',
        date: new Date('2026-01-22'),
        startTime: '15:00',
        endTime: '17:00',
        location: 'Room 205, Tech Hub',
        speaker: 'Dr. Emily Rodriguez',
        resources: [
          { title: 'Serverless Framework Guide', url: 'https://serverless.com/docs', type: 'link' },
          { title: 'Code Examples', url: '/resources/serverless-examples.zip', type: 'document' }
        ],
        createdBy: teachers[0]._id,
        isPublished: true
      },
      {
        topic: 'Cloud Security Fundamentals',
        description: 'Understanding security best practices, IAM, encryption, and compliance in cloud environments.',
        date: new Date('2026-01-25'),
        startTime: '14:30',
        endTime: '16:30',
        location: 'Auditorium A',
        speaker: 'Guest Speaker - Security Expert',
        resources: [
          { title: 'Security Checklist', url: '/resources/security-checklist.pdf', type: 'pdf' },
          { title: 'Case Studies', url: '/resources/security-cases.pdf', type: 'pdf' }
        ],
        createdBy: teachers[0]._id,
        isPublished: true
      }
    ]);
    console.log(`✅ Created ${agendas.length} agendas\n`);

    // 8. CREATE LEARNING CONTENT
    console.log('📚 Creating learning content...');
    const content = await Content.insertMany([
      {
        title: 'Introduction to AWS Cloud',
        description: 'Comprehensive introduction to Amazon Web Services and core cloud concepts including EC2, S3, RDS, and VPC.',
        type: 'video',
        topic: 'AWS',
        url: 'https://example.com/videos/aws-intro',
        uploadedBy: teachers[0]._id,
        isPublished: true
      },
      {
        title: 'Docker Complete Guide',
        description: 'Complete guide to containerization with Docker including Dockerfile creation, image management, and best practices.',
        type: 'pdf',
        topic: 'Docker',
        url: 'https://example.com/docs/docker-guide.pdf',
        uploadedBy: teachers[0]._id,
        isPublished: true
      },
      {
        title: 'Kubernetes Architecture Overview',
        description: 'Deep dive into Kubernetes architecture, components, and orchestration patterns for microservices.',
        type: 'slides',
        topic: 'Kubernetes',
        url: 'https://example.com/slides/k8s-architecture',
        uploadedBy: teachers[0]._id,
        isPublished: true
      },
      {
        title: 'Serverless Computing Tutorial',
        description: 'Learn serverless computing with AWS Lambda and Azure Functions. Build event-driven applications.',
        type: 'video',
        topic: 'Serverless',
        url: 'https://example.com/videos/serverless-tutorial',
        uploadedBy: teachers[0]._id,
        isPublished: true
      },
      {
        title: 'Cloud Security Best Practices',
        description: 'Essential security practices for cloud infrastructure and applications including IAM, encryption, and monitoring.',
        type: 'pdf',
        topic: 'Security',
        url: 'https://example.com/docs/security-practices.pdf',
        uploadedBy: teachers[0]._id,
        isPublished: true
      }
    ]);
    console.log(`✅ Created ${content.length} learning content items\n`);

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • ${students.length} Students`);
    console.log(`   • ${teachers.length} Teacher`);
    console.log(`   • ${admins.length} Admins`);
    console.log(`   • ${sessions.length} Sessions`);
    console.log(`   • ${attendanceRecords.length} Attendance Records`);
    console.log(`   • ${assignments.length} Assignments`);
    console.log(`   • ${submissions.length} Submissions`);
    console.log(`   • ${announcements.length} Announcements`);
    console.log(`   • ${agendas.length} Agendas`);
    console.log(`   • ${content.length} Learning Content Items`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔐 Login credentials for all users:');
    console.log('   Password: password123\n');
    console.log('📧 Sample login emails:');
    console.log('   Student: alice.johnson@college.edu');
    console.log('   Teacher: emily.rodriguez@college.edu');
    console.log('   Admin: john.anderson@college.edu\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seed script
seedTestData();
