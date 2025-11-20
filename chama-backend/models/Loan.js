import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add loan amount'],
    min: 0
  },
  interestRate: {
    type: Number,
    required: true,
    default: 10,
    min: 0,
    max: 100
  },
  termMonths: {
    type: Number,
    required: true,
    min: 1
  },
  monthlyPayment: {
    type: Number,
    required: true
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  disbursementDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'defaulted'],
    default: 'pending'
  },
  totalRepaid: {
    type: Number,
    default: 0
  },
  remainingBalance: {
    type: Number
  },
  nextPaymentDate: {
    type: Date
  },
  purpose: {
    type: String
  },
  guarantors: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    approved: {
      type: Boolean,
      default: false
    }
  }],
  repayments: [{
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    },
    paymentMethod: String,
    transactionId: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate remaining balance before saving
loanSchema.pre('save', function(next) {
  if (this.isModified('totalRepaid') || this.isModified('amount')) {
    this.remainingBalance = this.amount - this.totalRepaid;
  }
  next();
});

// Index for faster queries
loanSchema.index({ member: 1, status: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ nextPaymentDate: 1 });

const Loan = mongoose.model('Loan', loanSchema);

export default Loan;
