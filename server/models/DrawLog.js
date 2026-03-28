const mongoose = require('mongoose');

const drawLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'simulation_run',
      'draw_published',
      'draw_type_changed',
      'winner_verified',
      'winner_rejected',
      'winner_paid'
    ],
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  drawId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Draw'
  },
  details: {
    drawType: String,
    winningNumbers: [Number],
    participantCount: Number,
    simulationCount: Number,
    winnerCount: Number,
    prizePool: Number,
    previousData: mongoose.Schema.Types.Mixed,
    newData: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

drawLogSchema.index({ admin: 1, timestamp: -1 });
drawLogSchema.index({ drawId: 1, timestamp: -1 });
drawLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('DrawLog', drawLogSchema);
