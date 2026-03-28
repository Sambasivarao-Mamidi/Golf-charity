const Draw = require('../models/Draw');
const User = require('../models/User');
const Charity = require('../models/Charity');
const Score = require('../models/Score');

const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const [
      totalUsers,
      totalSubscribers,
      totalAdmins,
      totalDraws,
      totalCharities,
      activeCharities
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'subscriber' }),
      User.countDocuments({ role: 'admin' }),
      Draw.countDocuments({ status: 'completed' }),
      Charity.countDocuments(),
      Charity.countDocuments({ isActive: true })
    ]);

    const winnerStats = await Draw.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$winners' },
      {
        $group: {
          _id: '$winners.status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$winners.prizeAmount' }
        }
      }
    ]);

    const charityStats = await Charity.aggregate([
      {
        $group: {
          _id: null,
          totalRaised: { $sum: '$totalRaised' },
          totalIndependentDonations: { $sum: '$totalIndependentDonations' },
          totalCharities: { $sum: 1 }
        }
      }
    ]);

    const prizeStats = await Draw.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalPool: { $sum: '$totalPool' },
          totalCharityPool: { $sum: '$charityPool' },
          totalWinners: { $sum: { $size: '$winners' } }
        }
      }
    ]);

    const statusBreakdown = {
      pending: 0,
      'Awaiting Review': 0,
      Approved: 0,
      Rejected: 0
    };

    winnerStats.forEach(stat => {
      if (stat._id === 'Approved') {
        statusBreakdown.Approved = stat.count;
      } else if (stat._id === 'Rejected') {
        statusBreakdown.Rejected = stat.count;
      } else if (stat._id === 'Awaiting Review') {
        statusBreakdown['Awaiting Review'] = stat.count;
      } else if (stat._id === 'pending') {
        statusBreakdown.pending = stat.count;
      }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          subscribers: totalSubscribers,
          admins: totalAdmins,
          conversionRate: totalUsers > 0 ? ((totalSubscribers / totalUsers) * 100).toFixed(1) : 0
        },
        draws: {
          total: totalDraws
        },
        charities: {
          total: totalCharities,
          active: activeCharities,
          totalRaised: charityStats[0]?.totalRaised || 0,
          totalIndependentDonations: charityStats[0]?.totalIndependentDonations || 0
        },
        winners: {
          total: prizeStats[0]?.totalWinners || 0,
          byStatus: statusBreakdown
        },
        prizes: {
          totalPool: prizeStats[0]?.totalPool || 0,
          totalCharityPool: prizeStats[0]?.totalCharityPool || 0
        }
      }
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({ success: false, error: 'Server error fetching dashboard stats' });
  }
};

const getWinnerReport = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = { status: 'completed' };
    if (startDate || endDate) {
      matchStage.drawDate = dateFilter;
    }

    const winnerTiers = await Draw.aggregate([
      { $match: matchStage },
      { $unwind: '$winners' },
      {
        $group: {
          _id: '$winners.matchCount',
          count: { $sum: 1 },
          totalPrize: { $sum: '$winners.prizeAmount' }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const monthlyWinners = await Draw.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$winners' },
      {
        $group: {
          _id: {
            year: { $year: '$drawDate' },
            month: { $month: '$drawDate' }
          },
          count: { $sum: 1 },
          totalPrize: { $sum: '$winners.prizeAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const topWinners = await Draw.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$winners' },
      {
        $group: {
          _id: '$winners.user',
          totalWinnings: { $sum: '$winners.prizeAmount' },
          winCount: { $sum: 1 }
        }
      },
      { $sort: { totalWinnings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          totalWinnings: 1,
          winCount: 1,
          userName: '$user.name',
          userEmail: '$user.email'
        }
      }
    ]);

    const pendingVerification = await Draw.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$winners' },
      {
        $match: {
          'winners.status': { $in: ['pending', 'Awaiting Review'] }
        }
      },
      {
        $group: {
          _id: '$winners.status',
          count: { $sum: 1 },
          totalValue: { $sum: '$winners.prizeAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        tiers: winnerTiers,
        monthly: monthlyWinners,
        topWinners,
        pendingVerification,
        summary: {
          totalTiers: winnerTiers.length,
          totalTopWinners: topWinners.length
        }
      }
    });
  } catch (error) {
    console.error('Get Winner Report Error:', error);
    res.status(500).json({ success: false, error: 'Server error fetching winner report' });
  }
};

const getCharityReport = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const totalCharities = await Charity.countDocuments({});
    const charities = await Charity.find({})
      .populate('donations.user', 'name email')
      .sort({ totalRaised: -1 })
      .skip(skip)
      .limit(limit);

    const charityData = charities.map(charity => ({
      _id: charity._id,
      name: charity.name,
      isActive: charity.isActive,
      featured: charity.featured,
      totalRaised: charity.totalRaised,
      totalIndependentDonations: charity.totalIndependentDonations,
      allocationPercent: charity.allocationPercent,
      donationCount: charity.donations.length,
      donations: charity.donations.slice(-10).map(d => ({
        _id: d._id,
        amount: d.amount,
        date: d.date,
        donorName: d.user?.name || 'Unknown',
        donorEmail: d.user?.email || 'Unknown'
      }))
    }));

    const totalRaised = charities.reduce((sum, c) => sum + c.totalRaised, 0);
    const totalDonations = charities.reduce((sum, c) => sum + c.totalIndependentDonations, 0);
    const totalDonors = new Set(charities.flatMap(c => c.donations.map(d => d.user?.toString()))).size;

    const monthlyCharityDonations = await Draw.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$drawDate' },
            month: { $month: '$drawDate' }
          },
          amount: { $sum: '$charityPool' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        charities: charityData,
        pagination: {
          page,
          limit,
          total: totalCharities,
          pages: Math.ceil(totalCharities / limit)
        },
        summary: {
          totalCharities: totalCharities,
          activeCharities: charities.filter(c => c.isActive).length,
          totalRaised,
          totalDonations,
          totalDonors
        },
        monthlyDonations: monthlyCharityDonations
      }
    });
  } catch (error) {
    console.error('Get Charity Report Error:', error);
    res.status(500).json({ success: false, error: 'Server error fetching charity report' });
  }
};

const getUserGrowthReport = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const monthlyUsers = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          visitors: {
            $sum: { $cond: [{ $eq: ['$role', 'visitor'] }, 1, 0] }
          },
          subscribers: {
            $sum: { $cond: [{ $eq: ['$role', 'subscriber'] }, 1, 0] }
          },
          admins: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const activeUsers = await User.aggregate([
      {
        $match: { lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const scoreStats = await Score.aggregate([
      {
        $group: {
          _id: null,
          totalScores: { $sum: 1 },
          avgScore: { $avg: '$value' },
          minScore: { $min: '$value' },
          maxScore: { $max: '$value' }
        }
      }
    ]);

    const monthlyScores = await Score.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 },
          avgValue: { $avg: '$value' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        monthlyUsers: monthlyUsers.reverse(),
        roleDistribution,
        activeUsers,
        scores: scoreStats[0] || { totalScores: 0, avgScore: 0, minScore: 0, maxScore: 0 },
        monthlyScores: monthlyScores.reverse()
      }
    });
  } catch (error) {
    console.error('Get User Growth Report Error:', error);
    res.status(500).json({ success: false, error: 'Server error fetching user growth report' });
  }
};

module.exports = {
  getDashboardStats,
  getWinnerReport,
  getCharityReport,
  getUserGrowthReport
};
