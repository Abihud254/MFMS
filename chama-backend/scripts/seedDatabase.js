import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Member from '../models/Member.js';
import Contribution from '../models/Contribution.js';
import Loan from '../models/Loan.js';
import Meeting from '../models/Meeting.js';
import Notification from '../models/Notification.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Member.deleteMany({});
    await Contribution.deleteMany({});
    await Loan.deleteMany({});
    await Meeting.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data');

    // Create Members
    const members = await Member.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+254700123456',
        joinDate: new Date('2024-01-15'),
        status: 'active',
        totalContributions: 75000,
        nationalId: 'ID12345678',
        address: 'Nairobi, Kenya'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+254700123457',
        joinDate: new Date('2024-02-01'),
        status: 'active',
        totalContributions: 60000,
        nationalId: 'ID23456789',
        address: 'Mombasa, Kenya'
      },
      {
        name: 'Mike Wilson',
        email: 'mike@example.com',
        phone: '+254700123458',
        joinDate: new Date('2024-01-20'),
        status: 'active',
        totalContributions: 90000,
        nationalId: 'ID34567890',
        address: 'Kisumu, Kenya'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+254700123459',
        joinDate: new Date('2024-03-01'),
        status: 'active',
        totalContributions: 45000,
        nationalId: 'ID45678901',
        address: 'Nakuru, Kenya'
      },
      {
        name: 'David Brown',
        email: 'david@example.com',
        phone: '+254700123460',
        joinDate: new Date('2024-02-15'),
        status: 'active',
        totalContributions: 67500,
        nationalId: 'ID56789012',
        address: 'Eldoret, Kenya'
      },
      {
        name: 'Lisa Davis',
        email: 'lisa@example.com',
        phone: '+254700123461',
        joinDate: new Date('2024-03-15'),
        status: 'active',
        totalContributions: 52500,
        nationalId: 'ID67890123',
        address: 'Thika, Kenya'
      }
    ]);
    console.log(`Created ${members.length} members`);

    // Create Admin User
    const adminUser = await User.create({
      name: process.env.ADMIN_NAME || 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@chama.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      isActive: true
    });
    console.log('Created admin user');

    // Create Member Users
    const memberUsers = await User.create([
      {
        name: 'John Doe',
        email: 'john@chama.com',
        password: 'member123',
        role: 'member',
        member: members[0]._id,
        isActive: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@chama.com',
        password: 'member123',
        role: 'member',
        member: members[1]._id,
        isActive: true
      }
    ]);
    console.log(`Created ${memberUsers.length} member users`);

    // Create Contributions
    const contributions = [];
    for (let i = 0; i < 6; i++) {
      for (let month = 0; month < 5; month++) {
        const date = new Date();
        date.setMonth(date.getMonth() - month);
        contributions.push({
          member: members[i]._id,
          amount: 15000,
          date: date,
          type: 'monthly',
          status: 'completed',
          paymentMethod: 'mpesa',
          recordedBy: adminUser._id
        });
      }
    }
    await Contribution.create(contributions);
    console.log(`Created ${contributions.length} contributions`);

    // Create Loans
    await Loan.create([
      {
        member: members[1]._id,
        amount: 50000,
        interestRate: 10,
        termMonths: 12,
        monthlyPayment: 4600,
        applicationDate: new Date('2025-06-01'),
        approvalDate: new Date('2025-06-05'),
        disbursementDate: new Date('2025-06-06'),
        status: 'active',
        totalRepaid: 18400,
        remainingBalance: 31600,
        nextPaymentDate: new Date('2025-07-05'),
        purpose: 'Business expansion',
        approvedBy: adminUser._id
      },
      {
        member: members[2]._id,
        amount: 30000,
        interestRate: 8,
        termMonths: 6,
        monthlyPayment: 5400,
        applicationDate: new Date('2025-06-10'),
        approvalDate: new Date('2025-06-12'),
        disbursementDate: new Date('2025-06-13'),
        status: 'active',
        totalRepaid: 10800,
        remainingBalance: 19200,
        nextPaymentDate: new Date('2025-07-10'),
        purpose: 'School fees',
        approvedBy: adminUser._id
      },
      {
        member: members[0]._id,
        amount: 75000,
        interestRate: 12,
        termMonths: 18,
        monthlyPayment: 4800,
        applicationDate: new Date('2025-06-20'),
        status: 'pending',
        totalRepaid: 0,
        remainingBalance: 75000,
        nextPaymentDate: new Date('2025-07-20'),
        purpose: 'Home improvement'
      }
    ]);
    console.log('Created 3 loans');

    // Create Meetings
    await Meeting.create([
      {
        title: 'Monthly Contributions Review',
        date: new Date('2025-07-05'),
        time: '10:00',
        location: 'Community Center',
        agenda: ['Review monthly contributions', 'Discuss loan applications', 'Plan investment strategy'],
        status: 'upcoming',
        attendees: [
          { member: members[0]._id },
          { member: members[1]._id },
          { member: members[2]._id },
          { member: members[3]._id }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'Quarterly Financial Review',
        date: new Date('2025-06-20'),
        time: '14:00',
        location: 'Online Meeting',
        agenda: ['Q2 financial summary', 'Investment performance review', 'Loan portfolio assessment'],
        status: 'completed',
        attendees: members.map(m => ({ member: m._id, attended: true })),
        minutes: 'Discussed Q2 financial performance. Total savings increased by 15%. Approved 2 new loan applications.',
        decisions: [
          { description: 'Approve loans for Mike Wilson and Jane Smith', votesFor: 6, votesAgainst: 0, abstentions: 0 },
          { description: 'Invest 30% of surplus in government bonds', votesFor: 5, votesAgainst: 1, abstentions: 0 }
        ],
        createdBy: adminUser._id
      }
    ]);
    console.log('Created 2 meetings');

    // Create Notifications
    await Notification.create([
      {
        type: 'payment_reminder',
        title: 'Monthly Contribution Due',
        message: 'Your monthly contribution of KES 15,000 is due tomorrow.',
        member: members[0]._id,
        memberPhone: members[0].phone,
        status: 'sent',
        scheduledFor: new Date('2025-06-24T09:00:00'),
        sentAt: new Date('2025-06-24T09:00:00'),
        priority: 'medium',
        channel: 'sms',
        createdBy: adminUser._id
      },
      {
        type: 'loan_due',
        title: 'Loan Payment Due',
        message: 'Your loan payment of KES 4,600 is due in 3 days.',
        member: members[1]._id,
        memberPhone: members[1].phone,
        status: 'pending',
        scheduledFor: new Date('2025-06-27T10:00:00'),
        priority: 'high',
        channel: 'sms',
        createdBy: adminUser._id
      }
    ]);
    console.log('Created 2 notifications');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('===================');
    console.log('Admin:');
    console.log(`  Email: ${process.env.ADMIN_EMAIL || 'admin@chama.com'}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('\nMember:');
    console.log('  Email: john@chama.com');
    console.log('  Password: member123');
    console.log('\nYou can now start the server with: npm run dev');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
