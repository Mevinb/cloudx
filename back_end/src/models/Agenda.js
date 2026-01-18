/**
 * Agenda Model
 * Represents session agendas with topics and resources
 */

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['link', 'pdf', 'video', 'document', 'slides', 'other'],
    default: 'link'
  }
}, { _id: false });

const agendaSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Agenda date is required']
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
    maxlength: [200, 'Topic cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  speaker: {
    type: String,
    trim: true
  },
  speakerUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: String,
    trim: true
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  resources: [resourceSchema],
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registeredAttendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
agendaSchema.index({ date: -1 });
agendaSchema.index({ topic: 'text', description: 'text' });
agendaSchema.index({ createdBy: 1 });
agendaSchema.index({ tags: 1 });

// Virtual to check if agenda is upcoming
agendaSchema.virtual('isUpcoming').get(function() {
  return new Date(this.date) > new Date();
});

// Virtual for attendee count
agendaSchema.virtual('attendeeCount').get(function() {
  return this.registeredAttendees ? this.registeredAttendees.length : 0;
});

// Virtual for time (for backward compatibility)
agendaSchema.virtual('time').get(function() {
  if (this.startTime && this.endTime) {
    return `${this.startTime} - ${this.endTime}`;
  }
  return this.startTime || '';
});

// Virtual for attendees count alias
agendaSchema.virtual('attendees').get(function() {
  return this.registeredAttendees ? this.registeredAttendees.length : 0;
});

module.exports = mongoose.model('Agenda', agendaSchema);
