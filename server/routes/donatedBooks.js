// 📁 נתיב: /routes/donatedBooks.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const DonatedBook = require('../models/donatedBookModel');
const haversineDistance = require('../utils/calcDistance');

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

// GET /api/donatedBooks - חיפוש חכם עם מיון לפי קרבה
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.bookTitle) filters.bookTitle = { $regex: req.query.bookTitle, $options: 'i' };
    if (req.query.author) filters.author = { $regex: req.query.author, $options: 'i' };
    if (req.query.grade) filters.grade = req.query.grade;
    if (req.query.condition) filters.condition = req.query.condition;

    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);
    const sortByDistance = !isNaN(userLat) && !isNaN(userLng);

    console.log('User location:', { userLat, userLng }); // Debug log

    const results = await DonatedBook.aggregate([
      { $match: filters },
      {
        $addFields: {
          userObjectId: { $toObjectId: "$userId" }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
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
          subject: { $arrayElemAt: ['$bookDetails.subject', 0] },
          username: { $arrayElemAt: ['$userDetails.username', 0] },
          phone: { $arrayElemAt: ['$userDetails.phone', 0] },
          city: { $arrayElemAt: ['$userDetails.city', 0] },
          location: { $arrayElemAt: ['$userDetails.location', 0] }
        }
      },
      {
        $project: {
          bookDetails: 0,
          userDetails: 0,
          userObjectId: 0,
          _id: 1,
          userId: 1,
          bookTitle: 1,
          author: 1,
          grade: 1,
          condition: 1,
          subject: 1,
          username: 1,
          phone: 1,
          city: 1,
          location: 1
        }
      }
    ]);

    console.log('Books before distance calculation:', results); // Debug log

    if (sortByDistance) {
      results.forEach(book => {
        if (book.location && book.location.lat && book.location.lng) {
          book.distanceKm = Math.round(
            haversineDistance(
              userLat,
              userLng,
              parseFloat(book.location.lat),
              parseFloat(book.location.lng)
            ) * 10
          ) / 10;
          console.log(`Distance calculated for book ${book.bookTitle}:`, book.distanceKm); // Debug log
        } else {
          book.distanceKm = null;
          console.log(`No location data for book ${book.bookTitle}`); // Debug log
        }
      });

      results.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    console.log('Final results with distances:', results); // Debug log
    res.json(results);
  } catch (err) {
    console.error("❌ שגיאה בשליפת ספרים:", err);
    res.status(500).json({ message: 'שגיאה בשרת בעת שליפת ספרים' });
  }
});

module.exports = router;