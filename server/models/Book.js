const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  grade: String,
  subject: String,
  approvalNumber: Number,
  type: String,
  publisher: String,
  barcode: mongoose.Schema.Types.Mixed // כדי שיתמוך גם במספרים וגם במחרוזות
});

module.exports = mongoose.model("Book", bookSchema);
