/**
 * Book Model - Represents a book in the system
 * Used for storing basic book information and metadata
 */
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: String,        // Book title
  author: String,       // Book author
  grade: String,        // School grade level
  subject: String,      // Subject/Course
  approvalNumber: Number, // Ministry of Education approval number
  type: String,         // Book type/category
  publisher: String,    // Publishing company
  barcode: mongoose.Schema.Types.Mixed // Supports both numbers and strings
});

module.exports = mongoose.model("Book", bookSchema);
