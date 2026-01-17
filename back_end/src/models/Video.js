/**
 * Video Model
 * Stores YouTube video references for learning content
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
      required: [true, 'YouTube video ID is required'],
      trim: true,
    },
    youtubeUrl: {
      type: String,
      required: [true, 'YouTube URL is required'],
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

// Virtual for embed URL
videoSchema.virtual('embedUrl').get(function () {
  return `https://www.youtube.com/embed/${this.videoId}`;
});

// Virtual for thumbnail URL
videoSchema.virtual('thumbnailUrl').get(function () {
  return `https://img.youtube.com/vi/${this.videoId}/mqdefault.jpg`;
});

module.exports = mongoose.model('Video', videoSchema);
