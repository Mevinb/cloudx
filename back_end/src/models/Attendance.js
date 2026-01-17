/**
 * Attendance Model
 * Tracks student attendance for sessions
 */

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'Session is required']
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'absent'
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  method: {
    type: String,
    enum: ['manual', 'self', 'qr', 'auto'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per user per session
attendanceSchema.index({ user: 1, session: 1 }, { unique: true });
attendanceSchema.index({ session: 1 });
attendanceSchema.index({ user: 1 });
attendanceSchema.index({ status: 1 });

// Static method to get attendance summary for a session
attendanceSchema.statics.getSessionSummary = async function(sessionId) {
  const summary = await this.aggregate([
    { $match: { session: new mongoose.Types.ObjectId(sessionId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
  summary.forEach(item => {
    result[item._id] = item.count;
    result.total += item.count;
  });
  
  return result;
};

// Static method to get attendance summary for a user
attendanceSchema.statics.getUserSummary = async function(userId) {
  const summary = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
  summary.forEach(item => {
    result[item._id] = item.count;
    result.total += item.count;
  });
  
  // Calculate percentage
  result.percentage = result.total > 0 
    ? Math.round(((result.present + result.late) / result.total) * 100) 
    : 0;
  
  return result;
};

module.exports = mongoose.model('Attendance', attendanceSchema);
