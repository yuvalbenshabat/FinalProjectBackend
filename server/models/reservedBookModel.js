/**
 * Reserved Book Model - Represents a book that has been reserved by a user
 * Used for managing book reservations and tracking borrowed books
 */
const mongoose = require('mongoose');

const reservedBookSchema = new mongoose.Schema({
  donatedBookId: {        // Reference to the original donated book
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'DonatedBook'
  },
  userId: {               // ID of the user who reserved the book
    type: String,
    required: true
  },
  username: {             // Username of the reserver
    type: String,
    required: true 
  },
  reservedBy: {           // Name of the person who reserved the book
    type: String,
    required: true
  },
  bookTitle: {            // Title of the reserved book
    type: String,
    required: true
  },
  author: {               // Author of the book
    type: String,
    required: true
  },
  grade: {                // Grade level of the book
    type: String,
    required: true
  },
  barcode: {              // Book's barcode
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  condition: {            // Physical condition of the book
    type: String,
    required: true
  },
  subject: {              // Subject/Course of the book
    type: String
  },
  reservedUntil: {        // Reservation end date
    type: Date,
    required: true
  },
  imgUrl: {               // URL to book's image
    type: String,
    default: null
  },
  // New field - wishlist book ID if relevant
  wishlistBookId: {       // Reference to wishlist item if reserved from wishlist
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wishlist',
    default: null
  }

}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const ReservedBook = mongoose.model('ReservedBook', reservedBookSchema);

module.exports = ReservedBook;
