/**
 * Assignment Model
 * Represents assignments created by teachers
 */

const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileKey: {
    type: String
  },
  url: {
    type: String
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  }
}, { _id: true });

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  points: {
    type: Number,
    default: 100,
    min: [0, 'Points cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [attachmentSchema],
  allowLateSubmission: {
    type: Boolean,
    default: true
  },
  lateSubmissionPenalty: {
    type: Number,
    default: 10 // Percentage penalty per day
  },
  maxLateDay: {
    type: Number,
    default: 7
  },
  submissionType: {
    type: String,
    enum: ['file', 'link', 'text', 'any'],
    default: 'any'
  },
  topic: {
    type: String,
    trim: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ createdBy: 1 });
assignmentSchema.index({ topic: 1 });
assignmentSchema.index({ isPublished: 1 });

// Virtual for submissions
assignmentSchema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'assignment'
});

// Virtual to check if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return new Date(this.dueDate) < new Date();
});

// Virtual to check days remaining
assignmentSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Assignment', assignmentSchema);
