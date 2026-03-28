const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: String,
  location: String
}, { _id: true });

const donationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const charitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  allocationPercent: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  totalRaised: {
    type: Number,
    default: 0
  },
  totalIndependentDonations: {
    type: Number,
    default: 0
  },
  donations: [donationSchema],
  featured: {
    type: Boolean,
    default: false
  },
  events: [eventSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Charity', charitySchema);
