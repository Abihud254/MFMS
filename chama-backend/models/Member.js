import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add member name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add email'],
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number'],
    trim: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  totalContributions: {
    type: Number,
    default: 0
  },
  nationalId: {
    type: String,
    sparse: true
  },
  address: {
    type: String
  },
  nextOfKin: {
    name: String,
    phone: String,
    relationship: String
  },
  profilePhoto: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for contributions
memberSchema.virtual('contributions', {
  ref: 'Contribution',
  localField: '_id',
  foreignField: 'member',
  justOne: false
});

// Virtual for loans
memberSchema.virtual('loans', {
  ref: 'Loan',
  localField: '_id',
  foreignField: 'member',
  justOne: false
});

const Member = mongoose.model('Member', memberSchema);

export default Member;
