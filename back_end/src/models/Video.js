/**
 * Video Model
 * Stores YouTube and Google Drive video references for learning content
 */

const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    videoId: {
      type: String,
      required: [true, 'Video ID is required'],
      trim: true,
    },
    youtubeUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
videoSchema.index({ createdAt: -1 });
videoSchema.index({ addedBy: 1 });

// Virtual for embed URL (supports both YouTube and Google Drive)
videoSchema.virtual('embedUrl').get(function () {
  if (this.videoId?.startsWith('gdrive_')) {
    const driveId = this.videoId.replace('gdrive_', '');
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }
  return `https://www.youtube.com/embed/${this.videoId}`;
});

// Virtual for thumbnail URL (supports both YouTube and Google Drive)
videoSchema.virtual('thumbnailUrl').get(function () {
  if (this.videoId?.startsWith('gdrive_')) {
    // Google Drive doesn't provide direct thumbnail URLs
    // Return null and handle in frontend
    return null;
  }
  return `https://img.youtube.com/vi/${this.videoId}/mqdefault.jpg`;
});

module.exports = mongoose.model('Video', videoSchema);
