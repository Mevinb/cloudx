/**
 * Submission Model
 * Represents student submissions for assignments
 */

const mongoose = require('mongoose');

const submissionFileSchema = new mongoose.Schema({
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

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  content: {
    type: String,
    trim: true
  },
  submissionLink: {
    type: String,
    trim: true
  },
  files: [submissionFileSchema],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'late', 'graded', 'returned'],
    default: 'submitted'
  },
  isLate: {
    type: Boolean,
    default: false
  },
  // Grading fields
  score: {
    type: Number,
    min: [0, 'Score cannot be negative']
  },
  feedback: {
    type: String,
    trim: true
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  },
  // Resubmission tracking
  resubmissionCount: {
    type: Number,
    default: 0
  },
  previousSubmissions: [{
    content: String,
    link: String,
    files: [submissionFileSchema],
    submittedAt: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index - one submission per student per assignment (latest version)
submissionSchema.index({ assignment: 1, student: 1 });
submissionSchema.index({ student: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedAt: -1 });

// Pre-save middleware to check if submission is late
submissionSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('submittedAt')) {
    const Assignment = mongoose.model('Assignment');
    const assignment = await Assignment.findById(this.assignment);
    
    if (assignment && new Date(this.submittedAt) > new Date(assignment.dueDate)) {
      this.isLate = true;
      if (this.status === 'submitted') {
        this.status = 'late';
      }
    }
  }
  next();
});

// Virtual for percentage score
submissionSchema.virtual('percentageScore').get(function() {
  if (this.score === undefined || this.score === null) return null;
  // Need to populate assignment to get max points
  return this.score;
});

module.exports = mongoose.model('Submission', submissionSchema);
