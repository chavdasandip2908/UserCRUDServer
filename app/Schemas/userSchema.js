// User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mobile: String,
  gender: String,
  city: String,
  skills: [String],
  dob: Date,
  profileImage: String,
  password: String,
  socialMediaUrl: String,
});

module.exports = mongoose.model('User', userSchema);