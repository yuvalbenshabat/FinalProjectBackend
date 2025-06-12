// File: /routes/donatedBooks.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const DonatedBook = require('../models/donatedBookModel');
const haversineDistance = require('../utils/calcDistance');

// POST /api/donatedBooks - Save a donated book
router.post('/', async (req, res) => {
  try {
    const { userId, bookTitle, author, grade, barcode, condition, imgUrl } = req.body;

    if (!userId || !bookTitle || !author || !grade || !barcode || !condition) {
      return res.status(400).json({ message: 'חסר מידע בשדות' });
    }

    const newBook = new DonatedBook({
      userId,
      bookTitle,
      author,
      grade,
      barcode,
      condition,
      imgUrl
    });

    await newBook.save();
    res.status(201).json({ message: '✅ הספר נשמר בהצלחה', book: newBook });
  } catch (error) {
    console.error('❌ שגיאה בשמירת ספר:', error);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

// GET /api/donatedBooks - Smart search with distance-based sorting
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

    const results = await DonatedBook.aggregate([
      { $match: filters },
      {
        $addFields: {
          userObjectId: { $toObjectId: "$userId" }
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
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $addFields: {
          subject: { $arrayElemAt: ['$bookDetails.subject', 0] },
          username: { $arrayElemAt: ['$userDetails.username', 0] },
          phone: { $arrayElemAt: ['$userDetails.phone', 0] },
          city: { $arrayElemAt: ['$userDetails.city', 0] },
          lat: { $arrayElemAt: ['$userDetails.location.lat', 0] },
          lng: { $arrayElemAt: ['$userDetails.location.lng', 0] }
        }
      },
      ...(req.query.city ? [{
        $match: {
          city: { $regex: req.query.city, $options: 'i' }
        }
      }] : []),
      {
        $project: {
          bookDetails: 0,
          userDetails: 0,
          userObjectId: 0
        }
      }
    ]);

    if (sortByDistance) {
      for (let book of results) {
        if (book.lat && book.lng) {
          book.distanceKm = Math.round(haversineDistance(userLat, userLng, book.lat, book.lng) * 10) / 10;
        } else {
          book.distanceKm = null;
        }
      }

      results.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    res.json(results);
  } catch (err) {
    console.error("❌ שגיאה בשליפת ספרים:", err);
    res.status(500).json({ message: 'שגיאה בשרת בעת שליפת ספרים' });
  }
});

module.exports = router;
