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
