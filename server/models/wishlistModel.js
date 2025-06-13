const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
  title: { type: String, required: true },
  author: { type: String, required: true }
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
