import Member from '../models/Member.js';
import Loan from '../models/Loan.js';
import Contribution from '../models/Contribution.js';
import Meeting from '../models/Meeting.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Clear all data from the database (except the current admin user)
// @route   DELETE /api/admin/clear-database
// @access  Private (Admin only)
export const clearDatabase = async (req, res) => {
  try {
    // Be very careful with this! This will wipe almost everything!
    await Member.deleteMany({});
    await Loan.deleteMany({});
    await Contribution.deleteMany({});
    await Meeting.deleteMany({});
    await Notification.deleteMany({});

    // Delete all users except the currently logged-in admin
    await User.deleteMany({ _id: { $ne: req.user.id } });

    res.status(200).json({
      success: true,
      message: 'Database cleared successfully. All data except your admin account has been removed.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Promote a user to admin
// @route   PUT /api/admin/promote/:userId
// @access  Private (Admin only)
export const promoteToAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        user.role = 'admin';
        await user.save();

        res.status(200).json({
            success: true,
            data: user,
            message: 'User has been promoted to admin.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
