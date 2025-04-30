// server/routes/reservedBooks.js - גרסה חדשה עם $lookup על books להביא subject דינמית!

const express = require('express');
const router = express.Router();
const DonatedBook = require('../models/donatedBookModel');
const ReservedBook = require('../models/reservedBookModel');
const Book = require('../models/Book');

// ✅ שריון ספר - פשוט מעביר נתונים
router.post('/reserve/:id', async (req, res) => {
  try {
    const donatedBookId = req.params.id;
    const { reservedBy } = req.body;

    const bookToReserve = await DonatedBook.findById(donatedBookId);
    if (!bookToReserve) {
      return res.status(404).json({ message: 'הספר לא נמצא במאגר התרומות' });
    }

    const reservedBook = new ReservedBook({
      donatedBookId: bookToReserve._id,
      userId: bookToReserve.userId,
      reservedBy,
      bookTitle: bookToReserve.bookTitle,
      author: bookToReserve.author,
      grade: bookToReserve.grade,
      barcode: bookToReserve.barcode,
      condition: bookToReserve.condition,
      reservedUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });

    await reservedBook.save();
    await bookToReserve.deleteOne();

    res.status(200).json({ message: '✅ הספר שוריין בהצלחה', reservedBook });
  } catch (error) {
    console.error('❌ שגיאה בשריון ספר:', error);
    res.status(500).json({ message: 'שגיאה בשרת בעת שריון ספר' });
  }
});

// ✅ ביטול שריון ספר והחזרה לתרומות
router.post('/cancel/:id', async (req, res) => {
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
      condition: reservedBook.condition
    });

    await returnedBook.save();
    await reservedBook.deleteOne();

    res.status(200).json({ message: '✅ השריון בוטל והספר חזר למאגר התרומות' });
  } catch (error) {
    console.error('❌ שגיאה בביטול שריון:', error);
    res.status(500).json({ message: 'שגיאה בשרת בעת ביטול שריון' });
  }
});

// ✅ אישור סופי - מחיקת ספר משוריין
router.delete('/confirm/:id', async (req, res) => {
  try {
    const reservedBookId = req.params.id;
    await ReservedBook.findByIdAndDelete(reservedBookId);
    res.status(200).json({ message: '✅ הספר אושר ונמחק מהמאגר' });
  } catch (error) {
    console.error('❌ שגיאה באישור קבלה:', error);
    res.status(500).json({ message: 'שגיאה בשרת בעת אישור קבלה' });
  }
});

// ✅ שליפת ספרים משוריינים עם subject אמיתי דרך $lookup
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
