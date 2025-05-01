const mongoose = require('mongoose');

const donatedBookSchema = new mongoose.Schema({
  userId: {
    type: String,   // מזהה המשתמש שתרם את הספר
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
    type: mongoose.Schema.Types.Mixed,  // תמיכה גם במספר וגם במחרוזת
    required: true
  },
  condition: {
    type: String,
    required: true
  }
}, { timestamps: true }); // ייצור אוטומטי של createdAt ו-updatedAt

const DonatedBook = mongoose.model('DonatedBook', donatedBookSchema);

module.exports = DonatedBook;
