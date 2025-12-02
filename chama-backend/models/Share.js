import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add share amount'],
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['monthly', 'special', 'penalty', 'other'],
    default: 'monthly'
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'mpesa', 'bank_transfer', 'cheque'],
    default: 'cash'
  },
  transactionId: {
    type: String
  },
  notes: {
    type: String
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
shareSchema.index({ member: 1, date: -1 });
shareSchema.index({ status: 1 });

const Share = mongoose.model('Share', shareSchema);

export default Share;
