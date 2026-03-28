const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema({
  drawDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  winningNumbers: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 5 && v.every(n => n >= 1 && n <= 45);
      },
      message: 'Must have exactly 5 numbers between 1-45'
    }
  },
  drawType: {
    type: String,
    enum: ['random', 'weighted_least_frequent', 'weighted_most_frequent'],
    default: 'random'
  },
  totalPool: {
    type: Number,
    default: 0
  },
  charityPool: {
    type: Number,
    default: 0
  },
  winners: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    matchCount: {
      type: Number,
      enum: [3, 4, 5]
    },
    prizeAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'Awaiting Review', 'Approved', 'Rejected', 'Paid'],
      default: 'pending'
    },
    proofUrl: {
      type: String
    },
    proofSubmittedAt: {
      type: Date
    },
    paidAt: {
      type: Date
    },
    rejectionReason: {
      type: String
    }
  }],
  rolloverAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  simulationStats: {
    runs: { type: Number, default: 0 },
    avgFiveMatch: { type: Number, default: 0 },
    avgFourMatch: { type: Number, default: 0 },
    avgThreeMatch: { type: Number, default: 0 },
    minFiveMatch: { type: Number, default: 0 },
    maxFiveMatch: { type: Number, default: 0 }
  },
  prizeBreakdown: {
    totalCollected: { type: Number, default: 0 },
    charityPercent: { type: Number, default: 10 },
    charityAmount: { type: Number, default: 0 },
    prizePool: { type: Number, default: 0 },
    fiveMatchPool: { type: Number, default: 0 },
    fourMatchPool: { type: Number, default: 0 },
    threeMatchPool: { type: Number, default: 0 },
    fiveMatchWinners: { type: Number, default: 0 },
    fourMatchWinners: { type: Number, default: 0 },
    threeMatchWinners: { type: Number, default: 0 },
    fiveMatchPerWinner: { type: Number, default: 0 },
    fourMatchPerWinner: { type: Number, default: 0 },
    threeMatchPerWinner: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

drawSchema.index({ drawDate: -1 });
drawSchema.index({ status: 1, drawDate: -1 });

drawSchema.statics.calculatePrizes = function(totalPool, charityPercent = 10, rollover = 0) {
  const charityAmount = totalPool * (charityPercent / 100);
  const prizePool = totalPool - charityAmount + rollover;
  
  return {
    charityPool: charityAmount,
    prizePool: prizePool,
    fiveMatchPool: prizePool * 0.40,
    fourMatchPool: prizePool * 0.35,
    threeMatchPool: prizePool * 0.25,
    rollover: rollover
  };
};

module.exports = mongoose.model('Draw', drawSchema);
