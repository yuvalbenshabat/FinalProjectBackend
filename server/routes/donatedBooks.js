const express = require('express');
const router = express.Router();
const DonatedBook = require('../models/donatedBookModel');

// POST /api/donatedBooks - שמירת ספר
router.post('/', async (req, res) => {
  try {
    const { userId, bookTitle, author, grade, barcode, condition } = req.body;

    if (!userId || !bookTitle || !author || !grade || !barcode || !condition) {
      return res.status(400).json({ message: 'חסר מידע בשדות' });
    }

    const newBook = new DonatedBook({
      userId,
      bookTitle,
      author,
      grade,
      barcode,
      condition
    });

    await newBook.save();

    res.status(201).json({ message: '✅ הספר נשמר בהצלחה', book: newBook });
  } catch (error) {
    console.error('❌ שגיאה בשמירת ספר:', error);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

// GET /api/donatedBooks - חיפוש חכם עם תמיכה בסוגי ברקוד שונים
router.get('/', async (req, res) => {
  try {
    const filters = {};

    if (req.query.bookTitle) filters.bookTitle = { $regex: req.query.bookTitle, $options: 'i' };
    if (req.query.author) filters.author = { $regex: req.query.author, $options: 'i' };
    if (req.query.grade) filters.grade = req.query.grade;
    if (req.query.condition) filters.condition = req.query.condition;

    const results = await DonatedBook.aggregate([
      { $match: filters },
      {
        $lookup: {
          from: 'books',
          let: { donatedBarcode: "$barcode" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$barcode", "$$donatedBarcode"] },
                    { $eq: [{ $toString: "$barcode" }, "$$donatedBarcode"] },
                    { $eq: ["$barcode", { $toInt: "$$donatedBarcode" }] }
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

    res.json(results);
  } catch (err) {
    console.error("❌ שגיאה בשליפת ספרים:", err);
    res.status(500).json({ message: 'שגיאה בשרת בעת שליפת ספרים' });
  }
});

module.exports = router;
