# CloudX Club Management API

A production-ready REST API for managing a Cloud Computing Club built with Node.js, Express, and MongoDB.

## Features

- 🔐 **JWT Authentication** with access & refresh tokens
- 👥 **Role-Based Access Control** (Admin, Teacher, Student)
- 📅 **Session Management** for club meetings
- ✅ **Attendance Tracking** with CSV export
- 📋 **Agenda Management** for events
- 📚 **Learning Content** management (videos, PDFs, slides)
- 📝 **Assignments & Submissions** with grading
- 📢 **Announcements** system
- 📊 **Dashboards** for students and teachers

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** express-validator
- **File Upload:** Multer

## Project Structure

```
back_end/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # MongoDB connection
│   │   └── index.js     # App configuration
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── sessionController.js
│   │   ├── attendanceController.js
│   │   ├── agendaController.js
│   │   ├── contentController.js
│   │   ├── assignmentController.js
│   │   ├── announcementController.js
│   │   └── dashboardController.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # Authentication
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Session.js
│   │   ├── Attendance.js
│   │   ├── Agenda.js
│   │   ├── Content.js
│   │   ├── Assignment.js
│   │   ├── Submission.js
│   │   └── Announcement.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── sessions.js
│   │   ├── attendance.js
│   │   ├── agendas.js
│   │   ├── content.js
│   │   ├── assignments.js
│   │   ├── announcements.js
│   │   └── dashboard.js
│   ├── services/        # Business logic
│   │   ├── storageService.js
│   │   └── emailService.js
│   ├── seeds/           # Database seeders
│   │   └── seedData.js
│   └── server.js        # Entry point
├── uploads/             # File uploads
├── .env                 # Environment variables
├── .env.example         # Example env file
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18.x
- MongoDB >= 6.x
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd back_end
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Update `.env` with your configuration

6. Create uploads directory:
   ```bash
   mkdir uploads
   ```

7. Seed the database (optional):
   ```bash
   npm run seed
   ```

8. Start the server:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/refresh-token` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout user |
| GET | `/api/v1/auth/me` | Get current user |
| PUT | `/api/v1/auth/me` | Update profile |
| PUT | `/api/v1/auth/password` | Update password |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/users` | Get all users | Teacher/Admin |
| GET | `/api/v1/users/students` | Get all students | Teacher/Admin |
| GET | `/api/v1/users/stats` | Get member stats | Teacher/Admin |
| GET | `/api/v1/users/:id` | Get user by ID | Authenticated |
| PUT | `/api/v1/users/:id` | Update user | Admin |
| DELETE | `/api/v1/users/:id` | Delete user | Admin |

### Sessions
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/sessions` | Get all sessions | Authenticated |
| GET | `/api/v1/sessions/:id` | Get session | Authenticated |
| POST | `/api/v1/sessions` | Create session | Teacher/Admin |
| PUT | `/api/v1/sessions/:id` | Update session | Teacher/Admin |
| DELETE | `/api/v1/sessions/:id` | Delete session | Admin |

### Attendance
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/attendance/session/:id` | Get session attendance | Authenticated |
| GET | `/api/v1/attendance/user/:id` | Get user attendance | Authenticated |
| GET | `/api/v1/attendance/export/:id` | Export as CSV | Teacher/Admin |
| POST | `/api/v1/attendance/mark` | Mark attendance | Teacher/Admin |
| POST | `/api/v1/attendance/bulk` | Bulk mark | Teacher/Admin |
| POST | `/api/v1/attendance/checkin/:id` | Self check-in | Authenticated |

### Agendas
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/agendas` | Get all agendas | Authenticated |
| GET | `/api/v1/agendas/upcoming` | Get upcoming | Authenticated |
| GET | `/api/v1/agendas/:id` | Get agenda | Authenticated |
| POST | `/api/v1/agendas` | Create agenda | Teacher/Admin |
| PUT | `/api/v1/agendas/:id` | Update agenda | Teacher/Admin |
| DELETE | `/api/v1/agendas/:id` | Delete agenda | Admin |

### Content
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/content` | Get all content | Authenticated |
| GET | `/api/v1/content/topics` | Get topics | Authenticated |
| GET | `/api/v1/content/:id` | Get content | Authenticated |
| POST | `/api/v1/content` | Create content | Teacher/Admin |
| POST | `/api/v1/content/upload` | Upload file | Teacher/Admin |
| PUT | `/api/v1/content/:id` | Update content | Teacher/Admin |
| DELETE | `/api/v1/content/:id` | Delete content | Admin |

### Assignments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/assignments` | Get assignments | Authenticated |
| GET | `/api/v1/assignments/:id` | Get assignment | Authenticated |
| POST | `/api/v1/assignments` | Create assignment | Teacher/Admin |
| PUT | `/api/v1/assignments/:id` | Update assignment | Teacher/Admin |
| DELETE | `/api/v1/assignments/:id` | Delete assignment | Admin |
| POST | `/api/v1/assignments/:id/submit` | Submit | Student |
| GET | `/api/v1/assignments/:id/submissions` | Get submissions | Teacher/Admin |
| PUT | `/api/v1/submissions/:id/grade` | Grade submission | Teacher/Admin |

### Announcements
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/announcements` | Get announcements | Authenticated |
| GET | `/api/v1/announcements/recent` | Get recent | Authenticated |
| GET | `/api/v1/announcements/:id` | Get announcement | Authenticated |
| POST | `/api/v1/announcements` | Create | Teacher/Admin |
| PUT | `/api/v1/announcements/:id` | Update | Teacher/Admin |
| DELETE | `/api/v1/announcements/:id` | Delete | Admin |

### Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/dashboard/student` | Student dashboard | Student |
| GET | `/api/v1/dashboard/teacher` | Teacher dashboard | Teacher/Admin |
| GET | `/api/v1/dashboard/analytics` | Analytics | Admin |

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cloudx_club
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

## Test Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | password123 |
| Teacher | teacher@college.edu | password123 |
| Student | student@college.edu | password123 |

## License

MIT
