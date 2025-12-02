import Member from '../models/Member.js';
import Loan from '../models/Loan.js';
import Share from '../models/Share.js';
import Meeting from '../models/Meeting.js';

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();

    const totalSavingsResult = await Share.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalSavings = totalSavingsResult.length > 0 ? totalSavingsResult[0].total : 0;

    const activeLoans = await Loan.countDocuments({ status: 'active' });

    const totalLoanedResult = await Loan.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalLoaned = totalLoanedResult.length > 0 ? totalLoanedResult[0].total : 0;

    const nextMeeting = await Meeting.findOne({ status: 'upcoming' }).sort({ date: 1 });

    const pendingShares = await Share.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        totalMembers,
        totalSavings,
        activeLoans,
        totalLoaned,
        nextMeeting: nextMeeting ? nextMeeting.date : null,
        pendingShares
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/dashboard/recent-activities
// @access  Private
export const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Get limit from query, default to 10

    // Fetch recent shares
    const shares = await Share.find()
      .populate('member', 'name')
      .sort({ date: -1 })
      .limit(limit);

    // Fetch recent loans
    const loans = await Loan.find()
      .populate('member', 'name')
      .sort({ applicationDate: -1 })
      .limit(limit);

    // Fetch recent meetings
    const meetings = await Meeting.find()
      .sort({ date: -1 })
      .limit(limit);

    // Format activities
    const formattedShares = shares.map(c => ({
      id: c._id,
      type: 'share',
      member: c.member ? c.member.name : 'N/A',
      amount: c.amount,
      date: c.date,
      status: c.status
    }));

    const formattedLoans = loans.map(l => ({
      id: l._id,
      type: 'loan',
      member: l.member ? l.member.name : 'N/A',
      amount: l.amount,
      date: l.applicationDate,
      status: l.status
    }));

    const formattedMeetings = meetings.map(m => ({
      id: m._id,
      type: 'meeting',
      title: m.title,
      date: m.date,
      status: m.status
    }));

    // Combine and sort all activities
    const allActivities = [
      ...formattedShares,
      ...formattedLoans,
      ...formattedMeetings
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(0, limit); // Ensure only the top 'limit' activities are returned

    res.status(200).json({
      success: true,
      data: allActivities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};