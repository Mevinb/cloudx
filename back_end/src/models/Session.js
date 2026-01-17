/**
 * Session Model
 * Represents club sessions/meetings for attendance tracking
 */

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Session date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  location: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['workshop', 'lecture', 'lab', 'seminar', 'meeting', 'other'],
    default: 'workshop'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agenda: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agenda'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxCapacity: {
    type: Number,
    default: 100
  },
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
sessionSchema.index({ date: -1 });
sessionSchema.index({ createdBy: 1 });
sessionSchema.index({ type: 1 });

// Virtual for attendance count
sessionSchema.virtual('attendanceRecords', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'session'
});

// Virtual to check if session is upcoming
sessionSchema.virtual('isUpcoming').get(function() {
  return new Date(this.date) > new Date();
});

module.exports = mongoose.model('Session', sessionSchema);
