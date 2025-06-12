// 📁 נתיב: /models/userModel.js

/**
 * User Model - Represents a user in the system
 * Used for authentication and user profile management
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {             // User's display name
    type: String,
    required: true
  },
  email: {                // User's email address
    type: String,
    required: true,
    unique: true
  },
  password: {             // Hashed password
    type: String,
    required: true
  },
  phone: {                // User's phone number
    type: String
  },
  city: {                 // User's city of residence
    type: String
  },
  location: {             // User's geographical location
    lat: Number,
    lng: Number
  },
  registeredAt: {         // User registration timestamp
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
