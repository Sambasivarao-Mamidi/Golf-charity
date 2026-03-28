const Charity = require('../models/Charity');
const User = require('../models/User');

const listCharities = async (req, res) => {
  try {
    const charities = await Charity.find({ isActive: true })
      .sort({ featured: -1, name: 1 });

    res.json({
      success: true,
      data: charities
    });
  } catch (error) {
    console.error('List Charities Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching charities'
    });
  }
};

const getCharity = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);

    if (!charity) {
      return res.status(404).json({
        success: false,
        error: 'Charity not found'
      });
    }

    res.json({
      success: true,
      data: charity
    });
  } catch (error) {
    console.error('Get Charity Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching charity'
    });
  }
};

const updateAllocation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { charityId, allocationPercent } = req.body;

    if (allocationPercent < 10 || allocationPercent > 100) {
      return res.status(400).json({
        success: false,
        error: 'Charity allocation must be between 10% and 100%'
      });
    }

    if (charityId) {
      const charity = await Charity.findById(charityId);
      if (!charity) {
        return res.status(404).json({
          success: false,
          error: 'Charity not found'
        });
      }
    }

    const user = await User.findById(userId);
    user.charityAllocation = allocationPercent;
    if (charityId) {
      user.selectedCharity = charityId;
    }
    await user.save();

    res.json({
      success: true,
      data: {
        charityAllocation: user.charityAllocation,
        selectedCharity: user.selectedCharity
      }
    });
  } catch (error) {
    console.error('Update Allocation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating allocation'
    });
  }
};

const makeIndependentDonation = async (req, res) => {
  try {
    const { charityId, amount } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid donation amount'
      });
    }

    const charity = await Charity.findById(charityId);
    if (!charity || !charity.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Charity not found'
      });
    }

    charity.totalIndependentDonations += parseFloat(amount);
    charity.donations.push({
      user: userId,
      amount: parseFloat(amount),
      date: new Date()
    });
    await charity.save();

    res.json({
      success: true,
      data: {
        totalRaised: charity.totalRaised,
        totalIndependentDonations: charity.totalIndependentDonations,
        message: `Thank you for your $${amount} donation to ${charity.name}!`
      }
    });
  } catch (error) {
    console.error('Independent Donation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error processing donation'
    });
  }
};

const createCharity = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { name, description, website, image, allocationPercent, featured, events } = req.body;

    const charity = new Charity({
      name,
      description,
      website,
      image,
      allocationPercent: allocationPercent || 10,
      featured: featured || false,
      events: events || []
    });

    await charity.save();

    res.status(201).json({
      success: true,
      data: charity
    });
  } catch (error) {
    console.error('Create Charity Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating charity'
    });
  }
};

const updateCharity = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { id } = req.params;
    const updates = req.body;

    const charity = await Charity.findById(id);
    if (!charity) {
      return res.status(404).json({
        success: false,
        error: 'Charity not found'
      });
    }

    const allowedUpdates = ['name', 'description', 'website', 'image', 'allocationPercent', 'featured', 'events', 'isActive'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        charity[field] = updates[field];
      }
    });

    await charity.save();

    res.json({
      success: true,
      data: charity
    });
  } catch (error) {
    console.error('Update Charity Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating charity'
    });
  }
};

const deleteCharity = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { id } = req.params;

    const charity = await Charity.findById(id);
    if (!charity) {
      return res.status(404).json({
        success: false,
        error: 'Charity not found'
      });
    }

    charity.isActive = false;
    await charity.save();

    res.json({
      success: true,
      data: { message: 'Charity deactivated successfully' }
    });
  } catch (error) {
    console.error('Delete Charity Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting charity'
    });
  }
};

const getAllCharitiesAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const charities = await Charity.find({})
      .populate('donations.user', 'name email')
      .sort({ isActive: -1, featured: -1, name: 1 });

    const charitiesWithStats = charities.map(charity => ({
      ...charity.toObject(),
      donationCount: charity.donations.length,
      uniqueDonors: [...new Set(charity.donations.map(d => d.user?._id?.toString()))].filter(Boolean).length
    }));

    res.json({
      success: true,
      data: charitiesWithStats
    });
  } catch (error) {
    console.error('Get All Charities Admin Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching charities'
    });
  }
};

module.exports = { 
  listCharities, 
  getCharity, 
  updateAllocation, 
  createCharity,
  updateCharity,
  deleteCharity,
  makeIndependentDonation,
  getAllCharitiesAdmin
};
