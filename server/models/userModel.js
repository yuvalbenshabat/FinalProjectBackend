// 📁 נתיב: /models/userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone:    { type: String },
  city:     { type: String },
  location: {
    lat: Number,
    lng: Number
  },
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
