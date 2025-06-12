/**
 * Wishlist Model - Represents a book that a user wants to receive
 * Used for managing users' book requests and matching with donations
 */
const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId: {               // ID of the user who wants the book
    type: String,
    required: true
  },
  bookTitle: {            // Title of the requested book
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
  }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

module.exports = mongoose.model("Wishlist", wishlistSchema);
