/**
 * Child Model - Represents a child/student in the system
 * Used for managing student profiles and their book-related activities
 */
const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  name: String,          // Child's full name
  grade: String,         // Current school grade
  parentId: {           // Reference to parent/guardian user
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model("Child", childSchema);
