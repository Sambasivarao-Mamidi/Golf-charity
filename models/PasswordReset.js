const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  usedAt: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

passwordResetSchema.statics.generateToken = function(userId, email) {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  
  return {
    token,
    hashedToken,
    expiresAt,
    user: userId,
    email
  };
};

passwordResetSchema.statics.verifyToken = async function(token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const reset = await this.findOne({
    token: hashedToken,
    expiresAt: { $gt: new Date() },
    usedAt: null
  });
  return reset;
};

passwordResetSchema.index({ token: 1 });
passwordResetSchema.index({ user: 1 });
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
