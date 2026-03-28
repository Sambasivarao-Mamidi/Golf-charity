require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
  
  const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    name: { type: String, required: true }
  });
  
  userSchema.pre('save', async function(next) {
    console.log('Pre-save hook called');
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    next();
  });
  
  const User = mongoose.model('TestUser', userSchema);
  
  const user = new User({
    email: 'test@test.com',
    password: 'password123',
    name: 'Test'
  });
  
  user.save()
    .then(saved => {
      console.log('User saved:', saved);
      mongoose.disconnect();
    })
    .catch(err => {
      console.error('Error:', err.message);
      mongoose.disconnect();
    });
}).catch(err => {
  console.error('Connection error:', err.message);
});