const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 45
  },
  date: {
    type: Date,
    default: Date.now
  },
  course: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

scoreSchema.index({ user: 1, date: -1 });

scoreSchema.statics.enforceFiveScoreLimit = async function(userId) {
  const scores = await this.find({ user: userId }).sort({ date: -1 });
  
  if (scores.length > 5) {
    const toDelete = scores.slice(5);
    await this.deleteMany({ _id: { $in: toDelete.map(s => s._id) } });
  }
};

scoreSchema.statics.syncDrawNumbersFromScores = async function(userId) {
  const User = mongoose.model('User');
  const scores = await this.find({ user: userId }).sort({ date: -1 }).limit(5);
  const drawNumbers = scores.map(s => s.value);
  
  await User.findByIdAndUpdate(userId, { drawNumbers });
};

scoreSchema.post('save', async function(doc) {
  await doc.constructor.enforceFiveScoreLimit(doc.user);
  await doc.constructor.syncDrawNumbersFromScores(doc.user);
});

scoreSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.constructor.enforceFiveScoreLimit(doc.user);
    await doc.constructor.syncDrawNumbersFromScores(doc.user);
  }
});

const Score = mongoose.model('Score', scoreSchema);
module.exports = Score;