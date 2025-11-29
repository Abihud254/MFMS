import Member from '../models/Member.js';
import Loan from '../models/Loan.js';
import Contribution from '../models/Contribution.js';

// @desc    Get financial summary report
// @route   GET /api/reports/financial-summary
// @access  Private
export const getFinancialSummary = async (req, res) => {
  try {
    const memberCount = await Member.countDocuments();

    const totalSavingsResult = await Contribution.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalSavings = totalSavingsResult.length > 0 ? totalSavingsResult[0].total : 0;

    const totalContributionsResult = await Contribution.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalContributions = totalContributionsResult.length > 0 ? totalContributionsResult[0].total : 0;

    const totalLoansIssuedResult = await Loan.aggregate([
      { $match: { status: { $in: ['active', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalLoansIssued = totalLoansIssuedResult.length > 0 ? totalLoansIssuedResult[0].total : 0;

    const totalRepaymentsResult = await Loan.aggregate([
        { $group: { _id: null, total: { $sum: '$totalRepaid' } } }
    ]);
    const totalRepayments = totalRepaymentsResult.length > 0 ? totalRepaymentsResult[0].total : 0;
    
    const netCashFlow = totalContributions - totalLoansIssued;
    
    const averageContribution = memberCount > 0 ? totalContributions / memberCount : 0;

    const defaultedLoans = await Loan.countDocuments({ status: 'defaulted' });
    const totalLoans = await Loan.countDocuments();
    const loanDefaultRate = totalLoans > 0 ? (defaultedLoans / totalLoans) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalSavings,
        totalContributions,
        totalLoansIssued,
        totalRepayments,
        netCashFlow,
        memberCount,
        averageContribution,
        loanDefaultRate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get loan performance report
// @route   GET /api/reports/loan-performance
// @access  Private
export const getLoanPerformanceReport = async (req, res) => {
  try {
    const loans = await Loan.find().populate('member', 'name');

    const formattedLoans = loans.map(loan => ({
      _id: loan._id,
      member: loan.member ? loan.member.name : 'N/A',
      amount: loan.amount,
      outstanding: loan.remainingBalance,
      status: loan.status,
      nextPayment: loan.nextPaymentDate,
      totalRepaid: loan.totalRepaid
    }));

    const totalLoansIssued = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalRepaid = loans.reduce((sum, loan) => sum + loan.totalRepaid, 0);
    const repaymentRate = totalLoansIssued > 0 ? (totalRepaid / totalLoansIssued) * 100 : 0;
    const averageLoanSize = loans.length > 0 ? totalLoansIssued / loans.length : 0;

    res.status(200).json({
      success: true,
      data: {
        loans: formattedLoans,
        summary: {
          totalLoansIssued,
          repaymentRate: repaymentRate.toFixed(1),
          averageLoanSize
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get contribution report
// @route   GET /api/reports/contributions
// @access  Private
export const getContributionReport = async (req, res) => {
    try {
        const memberContributions = await Contribution.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: '$member',
                    totalContributions: { $sum: '$amount' },
                    contributionsCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'members',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'member'
                }
            },
            {
                $unwind: '$member'
            },
            {
                $project: {
                    _id: 0,
                    name: '$member.name',
                    totalContributions: '$totalContributions',
                    monthlyAverage: { $divide: ['$totalContributions', '$contributionsCount'] },
                    status: 'up-to-date' // Placeholder status
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: memberContributions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get monthly trends report
// @route   GET /api/reports/trends
// @access  Private
export const getTrendsReport = async (req, res) => {
  try {
    const monthlyContributions = await Contribution.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalContributions: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyLoans = await Loan.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$applicationDate' },
            month: { $month: '$applicationDate' }
          },
          totalLoansIssued: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyRepayments = await Loan.aggregate([
      { $unwind: '$repayments' },
      {
        $group: {
          _id: {
            year: { $year: '$repayments.date' },
            month: { $month: '$repayments.date' }
          },
          totalRepayments: { $sum: '$repayments.amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Combine into a single monthly data structure
    const monthlyDataMap = new Map();

    monthlyContributions.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!monthlyDataMap.has(key)) {
        monthlyDataMap.set(key, { year: item._id.year, month: item._id.month, contributions: 0, loans: 0, repayments: 0 });
      }
      monthlyDataMap.get(key).contributions = item.totalContributions;
    });

    monthlyLoans.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!monthlyDataMap.has(key)) {
        monthlyDataMap.set(key, { year: item._id.year, month: item._id.month, contributions: 0, loans: 0, repayments: 0 });
      }
      monthlyDataMap.get(key).loans = item.totalLoansIssued;
    });

    monthlyRepayments.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!monthlyDataMap.has(key)) {
        monthlyDataMap.set(key, { year: item._id.year, month: item._id.month, contributions: 0, loans: 0, repayments: 0 });
      }
      monthlyDataMap.get(key).repayments = item.totalRepayments;
    });

    const combinedMonthlyData = Array.from(monthlyDataMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    res.status(200).json({
      success: true,
      data: combinedMonthlyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
