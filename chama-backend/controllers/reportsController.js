import Member from '../models/Member.js';
import Loan from '../models/Loan.js';
import Share from '../models/Share.js';

// @desc    Get financial summary report
// @route   GET /api/reports/financial-summary
// @access  Private
export const getFinancialSummary = async (req, res) => {
  try {
    const memberCount = await Member.countDocuments();

    const totalSavingsResult = await Share.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalSavings = totalSavingsResult.length > 0 ? totalSavingsResult[0].total : 0;

    const totalSharesResult = await Share.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalShares = totalSharesResult.length > 0 ? totalSharesResult[0].total : 0;

    const totalLoansIssuedResult = await Loan.aggregate([
      { $match: { status: { $in: ['active', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalLoansIssued = totalLoansIssuedResult.length > 0 ? totalLoansIssuedResult[0].total : 0;

    const totalRepaymentsResult = await Loan.aggregate([
        { $group: { _id: null, total: { $sum: '$totalRepaid' } } }
    ]);
    const totalRepayments = totalRepaymentsResult.length > 0 ? totalRepaymentsResult[0].total : 0;
    
    const netCashFlow = totalShares - totalLoansIssued;
    
    const averageShare = memberCount > 0 ? totalShares / memberCount : 0;

    const defaultedLoans = await Loan.countDocuments({ status: 'defaulted' });
    const totalLoans = await Loan.countDocuments();
    const loanDefaultRate = totalLoans > 0 ? (defaultedLoans / totalLoans) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalSavings,
        totalShares,
//...
        averageShare,
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

// @desc    Get share report
// @route   GET /api/reports/shares
// @access  Private
export const getShareReport = async (req, res) => {
    try {
        const memberShares = await Share.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: '$member',
                    totalShares: { $sum: '$amount' },
                    sharesCount: { $sum: 1 }
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
                    totalShares: '$totalShares',
                    monthlyAverage: { $divide: ['$totalShares', '$sharesCount'] },
                    status: 'up-to-date' // Placeholder status
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: memberShares
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
    const monthlyShares = await Share.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalShares: { $sum: '$amount' }
        }
      },
//...
    monthlyShares.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!monthlyDataMap.has(key)) {
        monthlyDataMap.set(key, { year: item._id.year, month: item._id.month, shares: 0, loans: 0, repayments: 0 });
      }
      monthlyDataMap.get(key).shares = item.totalShares;
    });

    monthlyLoans.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!monthlyDataMap.has(key)) {
        monthlyDataMap.set(key, { year: item._id.year, month: item._id.month, shares: 0, loans: 0, repayments: 0 });
      }
      monthlyDataMap.get(key).loans = item.totalLoansIssued;
    });

    monthlyRepayments.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!monthlyDataMap.has(key)) {
        monthlyDataMap.set(key, { year: item._id.year, month: item._id.month, shares: 0, loans: 0, repayments: 0 });
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
