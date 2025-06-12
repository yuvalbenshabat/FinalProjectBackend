/**
 * Donated Book Model - Represents a book donated by a user
 * Used for managing the book donation system and tracking donated books
 */
const mongoose = require('mongoose');

const donatedBookSchema = new mongoose.Schema({
  userId: {              // Reference to the donor
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  bookTitle: {           // Title of the donated book
    type: String,
    required: true
  },
  author: {              // Author of the book
    type: String,
    required: true
  },
  grade: {               // Grade level the book is intended for
    type: String,
    required: true
  },
  barcode: {             // Book's barcode (can be number or string)
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  condition: {           // Physical condition of the book
    type: String,
    required: true
  },
  imgUrl: {              // URL to book's image
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        return v === null || typeof v === 'string';
      },
      message: 'כתובת התמונה חייבת להיות ריקה או מחרוזת'
    }
  }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const DonatedBook = mongoose.model('DonatedBook', donatedBookSchema);

module.exports = DonatedBook;
