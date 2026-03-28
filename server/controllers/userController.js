const User = require('../models/User');
const Score = require('../models/Score');
const Subscription = require('../models/Subscription');
const Draw = require('../models/Draw');
const Charity = require('../models/Charity');
const crypto = require('crypto');

const listUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20, includeInactive } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (!includeInactive) {
      query.isActive = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('selectedCharity', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    const usersWithStats = await Promise.all(users.map(async (user) => {
      const scoreCount = await Score.countDocuments({ user: user._id });
      const subscription = user.subscription ? await Subscription.findById(user.subscription) : null;
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        charityAllocation: user.charityAllocation,
        selectedCharity: user.selectedCharity,
        drawNumbers: user.drawNumbers,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        stats: {
          scoresCount: scoreCount,
          subscriptionStatus: subscription?.status || null,
          planType: subscription?.planType || null
        }
      };
    }));

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List Users Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching users'
    });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password').populate('selectedCharity', 'name image');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const [scores, subscription, stats] = await Promise.all([
      Score.find({ user: id }).sort({ date: -1 }).limit(10),
      user.subscription ? Subscription.findById(user.subscription) : null,
      getUserStats(id)
    ]);

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        scores,
        subscription,
        stats
      }
    });
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user'
    });
  }
};

const getUserStats = async (userId) => {
  try {
    const draws = await Draw.find({ 'winners.user': userId });
    
    let drawsParticipated = 0;
    let drawsWon = 0;
    let totalWinnings = 0;
    let pendingWinnings = 0;

    draws.forEach(draw => {
      const userWinner = draw.winners.find(w => w.user.toString() === userId.toString());
      if (userWinner) {
        drawsParticipated++;
        drawsWon++;
        totalWinnings += userWinner.prizeAmount;
        if (userWinner.status === 'pending' || userWinner.status === 'Awaiting Review') {
          pendingWinnings += userWinner.prizeAmount;
        }
      }
    });

    return {
      drawsParticipated,
      drawsWon,
      totalWinnings,
      pendingWinnings
    };
  } catch (error) {
    return {
      drawsParticipated: 0,
      drawsWon: 0,
      totalWinnings: 0,
      pendingWinnings: 0
    };
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, charityAllocation, selectedCharity, isActive } = req.body;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (charityAllocation !== undefined) user.charityAllocation = charityAllocation;
    if (selectedCharity !== undefined) user.selectedCharity = selectedCharity;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    const updatedUser = await User.findById(id).select('-password').populate('selectedCharity', 'name');

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating user'
    });
  }
};

const getUserScores = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const scores = await Score.find({ user: id }).sort({ date: -1 });

    res.json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error('Get User Scores Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user scores'
    });
  }
};

const updateUserScore = async (req, res) => {
  try {
    const { id, scoreId } = req.params;
    const { value, course } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const score = await Score.findOne({ _id: scoreId, user: id });
    if (!score) {
      return res.status(404).json({
        success: false,
        error: 'Score not found'
      });
    }

    if (value !== undefined) {
      if (value < 1 || value > 45) {
        return res.status(400).json({
          success: false,
          error: 'Score must be between 1 and 45'
        });
      }
      score.value = parseInt(value);
    }

    if (course !== undefined) {
      score.course = course || 'Unknown Course';
    }

    await score.save();

    const scores = await Score.find({ user: id }).sort({ date: -1 });

    res.json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error('Update User Score Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating score'
    });
  }
};

const deleteUserScore = async (req, res) => {
  try {
    const { id, scoreId } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const score = await Score.findOneAndDelete({ _id: scoreId, user: id });
    if (!score) {
      return res.status(404).json({
        success: false,
        error: 'Score not found'
      });
    }

    const scores = await Score.find({ user: id }).sort({ date: -1 });

    res.json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error('Delete User Score Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting score'
    });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    res.json({
      success: true,
      data: {
        message: 'Password reset link generated',
        resetToken,
        expiresIn: '1 hour'
      }
    });
  } catch (error) {
    console.error('Reset User Password Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error resetting password'
    });
  }
};

const cancelUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.role !== 'subscriber') {
      return res.status(400).json({
        success: false,
        error: 'User does not have an active subscription'
      });
    }

    user.role = 'visitor';
    user.subscription = null;
    await user.save();

    res.json({
      success: true,
      data: { message: 'Subscription canceled successfully' }
    });
  } catch (error) {
    console.error('Cancel User Subscription Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error canceling subscription'
    });
  }
};

module.exports = {
  listUsers,
  getUser,
  updateUser,
  getUserScores,
  updateUserScore,
  deleteUserScore,
  resetUserPassword,
  cancelUserSubscription
};
