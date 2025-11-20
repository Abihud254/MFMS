import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['payment_reminder', 'loan_due', 'meeting_reminder', 'system', 'welcome'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  memberPhone: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'scheduled'],
    default: 'pending'
  },
  scheduledFor: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channel: {
    type: String,
    enum: ['sms', 'email', 'push', 'whatsapp'],
    default: 'sms'
  },
  metadata: {
    contributionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contribution'
    },
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan'
    },
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting'
    }
  },
  response: {
    success: Boolean,
    messageId: String,
    error: String,
    provider: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ member: 1, createdAt: -1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ scheduledFor: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
