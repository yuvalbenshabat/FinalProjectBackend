const mongoose = require('mongoose');

const donatedBookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // שינוי מ-String ל-ObjectId
    ref: 'User',                          // קישור למודל User
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
    type: mongoose.Schema.Types.Mixed, // תמיכה גם במספר וגם במחרוזת
    required: true
  },
  condition: {
    type: String,
    required: true
  }
}, { timestamps: true }); // מוסיף createdAt ו-updatedAt אוטומטית

const DonatedBook = mongoose.model('DonatedBook', donatedBookSchema);

module.exports = DonatedBook;
