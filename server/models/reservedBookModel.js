const mongoose = require('mongoose');

const reservedBookSchema = new mongoose.Schema({
  donatedBookId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'DonatedBook' // קישור לספר המקורי
  },
  userId: {
    type: String,
    required: true
  },
    username: { type: String,
    required: true 
  },
  reservedBy: {
    type: String,
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
  barcode: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  subject: {
    type: String
  },
  reservedUntil: {
    type: Date,
    required: true
  },
  imgUrl: {
    type: String,
    default: null
  },
  // ✅ שדה חדש - מזהה הספר מרשימת המשאלות אם רלוונטי
  wishlistBookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wishlist',
    default: null
  }

}, { timestamps: true });

const ReservedBook = mongoose.model('ReservedBook', reservedBookSchema);

module.exports = ReservedBook;
