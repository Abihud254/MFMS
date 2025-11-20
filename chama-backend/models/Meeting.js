import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add meeting title'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please add meeting date']
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: [true, 'Please add meeting location']
  },
  agenda: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled', 'postponed'],
    default: 'upcoming'
  },
  attendees: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    attended: {
      type: Boolean,
      default: false
    },
    confirmed: {
      type: Boolean,
      default: false
    }
  }],
  minutes: {
    type: String
  },
  decisions: [{
    description: String,
    votesFor: Number,
    votesAgainst: Number,
    abstentions: Number
  }],
  attachments: [{
    name: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
meetingSchema.index({ date: -1 });
meetingSchema.index({ status: 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
