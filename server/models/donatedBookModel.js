const mongoose = require('mongoose');

const donatedBookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // 👈 שינינו מ-String ל-ObjectId
    ref: 'User',                          // 👈 הוספנו קישור לטבלת המשתמשים
    required: true
  },
  bookTitle: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  subject: {
    type: String
  },
  barcode: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  condition: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('DonatedBook', donatedBookSchema);
