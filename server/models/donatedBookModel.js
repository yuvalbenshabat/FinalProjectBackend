const mongoose = require('mongoose');

const donatedBookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  imgUrl: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        return v === null || typeof v === 'string';
      },
      message: 'imgUrl must be null or a string'
    }
  }
}, { timestamps: true });

const DonatedBook = mongoose.model('DonatedBook', donatedBookSchema);

module.exports = DonatedBook;
