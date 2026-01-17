/**
 * Content Model
 * Represents learning materials (videos, PDFs, presentations)
 */

const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['video', 'pdf', 'slides', 'document', 'link', 'other'],
    required: [true, 'Content type is required']
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  fileKey: {
    type: String // For cloud storage file reference
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  },
  duration: {
    type: String // For videos
  },
  pageCount: {
    type: Number // For PDFs
  },
  slideCount: {
    type: Number // For presentations
  },
  embedUrl: {
    type: String // For embedded videos (YouTube, Vimeo, etc.)
  },
  thumbnail: {
    type: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  accessLevel: {
    type: String,
    enum: ['all', 'members', 'teachers', 'admin'],
    default: 'members'
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
contentSchema.index({ type: 1 });
contentSchema.index({ topic: 1 });
contentSchema.index({ uploadedBy: 1 });
contentSchema.index({ title: 'text', description: 'text', topic: 'text' });
contentSchema.index({ tags: 1 });
contentSchema.index({ createdAt: -1 });

// Method to increment views
contentSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Method to increment downloads
contentSchema.methods.incrementDownloads = async function() {
  this.downloads += 1;
  await this.save();
};

module.exports = mongoose.model('Content', contentSchema);
