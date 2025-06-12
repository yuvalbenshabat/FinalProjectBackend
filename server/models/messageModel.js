/**
 * Message Model - Represents a chat message between users
 * Used for the in-app messaging system
 */
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: String,        // ID of the message sender
  receiver: String,      // ID of the message receiver
  content: String,       // Message content/text
  timestamp: {           // When the message was sent
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", messageSchema);