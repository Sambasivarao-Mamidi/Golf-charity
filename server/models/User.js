const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  role: {
    type: String,
    enum: ['visitor', 'subscriber', 'admin'],
    default: 'visitor'
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  charityAllocation: {
    type: Number,
    default: 10,
    min: 10,
    max: 100
  },
  selectedCharity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity'
  },
  drawNumbers: {
    type: [Number],
    validate: {
      validator: function(v) {
        return v === undefined || v === null || v.length === 0 || v.length <= 5;
      },
      message: 'Must have at most 5 draw numbers'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    if (!this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
