const express = require('express');
const router = express.Router();
const DonatedBook = require('../models/donatedBookModel');
const ReservedBook = require('../models/reservedBookModel');
const Book = require('../models/bookModel');
const Wishlist = require('../models/wishlistModel'); // Added Wishlist model
const User = require('../models/userModel'); // Added User model import

// Reserve a book
router.post('/reserve/:id', async (req, res) => {
  try {
    const donatedBookId = req.params.id;
    const { reservedBy, wishlistBookId } = req.body; // Additional input

    const bookToReserve = await DonatedBook.findById(donatedBookId);
    if (!bookToReserve) {
      return res.status(404).json({ message: 'הספר לא נמצא במאגר התרומות' });
    }

    // Get donor's username
    const donorUser = await User.findById(bookToReserve.userId);
    if (!donorUser) {
      return res.status(404).json({ message: 'לא נמצא המשתמש התורם' });
    }

    const reservedBook = new ReservedBook({
      donatedBookId: bookToReserve._id,
      userId: bookToReserve.userId,
      username: donorUser.username, // Use username from user model
      reservedBy,
      bookTitle: bookToReserve.bookTitle,
      author: bookToReserve.author,
      grade: bookToReserve.grade,
      barcode: bookToReserve.barcode,
      condition: bookToReserve.condition,
      imgUrl: bookToReserve.imgUrl,
      reservedUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      wishlistBookId: wishlistBookId || null // Link if exists
    });

    await reservedBook.save();
    await DonatedBook.findByIdAndDelete(donatedBookId); // Remove from donations

    res.status(200).json({ message: '✅ הספר שוריין בהצלחה', reservedBook });
  } catch (error) {
    console.error('❌ שגיאה בשריון ספר:', error);
    res.status(500).json({ message: 'שגיאה בשרת בעת שריון ספר' });
  }
});

// Cancel reservation
router.delete('/cancel/:id', async (req, res) => {
  try {
    const reservedBookId = req.params.id;

    const reservedBook = await ReservedBook.findById(reservedBookId);
    if (!reservedBook) {
      return res.status(404).json({ message: 'ספר משוריין לא נמצא' });
    }

    const returnedBook = new DonatedBook({
      userId: reservedBook.userId,
      bookTitle: reservedBook.bookTitle,
      author: reservedBook.author,
      grade: reservedBook.grade,
      barcode: reservedBook.barcode,
      condition: reservedBook.condition,
      imgUrl: reservedBook.imgUrl
    });

    await returnedBook.save();
    await ReservedBook.findByIdAndDelete(reservedBookId);

    res.status(200).json({ message: '✅ השריון בוטל והספר חזר למאגר התרומות' });
  } catch (error) {
    console.error('❌ שגיאה בביטול שריון:', error);
    res.status(500).json({ message: 'שגיאה בשרת בעת ביטול שריון' });
  }
});

// Confirm receipt
router.delete('/confirm/:id', async (req, res) => {
  try {
    const reservedBookId = req.params.id;

    const reservedBook = await ReservedBook.findById(reservedBookId);
    if (!reservedBook) {
      return res.status(404).json({ message: "ספר משוריין לא נמצא" });
    }

    // If linked to wishlist → delete there too
    if (reservedBook.wishlistBookId) {
      await Wishlist.findByIdAndDelete(reservedBook.wishlistBookId);
    }

    await ReservedBook.findByIdAndDelete(reservedBookId);

    res.status(200).json({ message: '✅ הספר אושר ונמחק מהמאגר' });
  } catch (error) {
    console.error('❌ שגיאה באישור קבלה:', error);
    res.status(500).json({ message: 'שגיאה בשרת בעת אישור קבלה' });
  }
});

// Get reserved books with subject
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const reservedBooks = await ReservedBook.aggregate([
      { $match: { reservedBy: userId } },
      {
        $lookup: {
          from: 'books',
          let: { reservedBarcode: "$barcode" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$barcode", "$$reservedBarcode"] },
                    { $eq: [{ $toString: "$barcode" }, "$$reservedBarcode"] },
                    { $eq: ["$barcode", { $toInt: "$$reservedBarcode" }] }
                  ]
                }
              }
            }
          ],
          as: 'bookDetails'
        }
      },
      {
        $addFields: {
          subject: { $arrayElemAt: ['$bookDetails.subject', 0] }
        }
      },
      {
        $project: {
          bookDetails: 0
        }
      }
    ]);

    res.status(200).json(reservedBooks);
  } catch (error) {
    console.error('❌ שגיאה בשליפת ספרים משוריינים:', error);
    res.status(500).json({ message: 'שגיאה בשליפת ספרים משוריינים' });
  }
});

module.exports = router;
