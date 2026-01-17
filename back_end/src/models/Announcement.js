/**
 * Announcement Model
 * Represents club announcements from admin/teachers
 */

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'medium', 'high', 'urgent'],
    default: 'normal'
  },
  category: {
    type: String,
    enum: ['General', 'Event', 'Assignment', 'Resources', 'Urgent', 'Other'],
    default: 'General'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'teachers', 'batch'],
    default: 'all'
  },
  targetBatch: {
    type: String // If targetAudience is 'batch'
  },
  attachments: [{
    fileName: String,
    fileKey: String,
    url: String
  }],
  expiresAt: {
    type: Date // Optional expiry date
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ isPinned: -1, createdAt: -1 });
announcementSchema.index({ author: 1 });
announcementSchema.index({ category: 1 });
announcementSchema.index({ priority: 1 });
announcementSchema.index({ targetAudience: 1 });

// Virtual for read count
announcementSchema.virtual('readCount').get(function() {
  return this.readBy ? this.readBy.length : 0;
});

// Check if expired
announcementSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date(this.expiresAt) < new Date();
});

// Static method to get announcements for a user
announcementSchema.statics.getForUser = async function(user, options = {}) {
  const query = {
    isPublished: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  };
  
  // Filter by audience
  const audienceFilter = [{ targetAudience: 'all' }];
  
  if (user.role === 'student') {
    audienceFilter.push({ targetAudience: 'students' });
    if (user.batch) {
      audienceFilter.push({ targetAudience: 'batch', targetBatch: user.batch });
    }
  } else if (user.role === 'teacher') {
    audienceFilter.push({ targetAudience: 'teachers' });
  }
  
  query.$and = [{ $or: audienceFilter }];
  
  return this.find(query)
    .populate('author', 'name role avatar')
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(options.limit || 50);
};

module.exports = mongoose.model('Announcement', announcementSchema);
