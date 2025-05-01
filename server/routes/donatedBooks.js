const express = require("express");
const router = express.Router();
const DonatedBook = require("../models/donatedBookModel");
const User = require("../models/userModel"); // נוסיף את זה

router.get("/", async (req, res) => {
  try {
    const filters = {};

    if (req.query.bookTitle) filters.bookTitle = { $regex: req.query.bookTitle, $options: "i" };
    if (req.query.author) filters.author = { $regex: req.query.author, $options: "i" };
    if (req.query.grade) filters.grade = req.query.grade;
    if (req.query.subject) filters.subject = { $regex: req.query.subject, $options: "i" };
    if (req.query.condition) filters.condition = req.query.condition;

    // 1. שלוף את הספרים כרגיל (בלי populate)
    const books = await DonatedBook.find(filters).sort({ createdAt: -1 });

    // 2. עבור על כל ספר ושלוף את פרטי המשתמש לפי userId (שהוא מחרוזת)
    const booksWithDonorInfo = await Promise.all(
      books.map(async (book) => {
        const donor = await User.findById(book.userId).select("username city phone");
        return {
          ...book.toObject(),
          donor: donor || null
        };
      })
    );

    res.json(booksWithDonorInfo);
  } catch (error) {
    console.error("❌ שגיאה בשליפת ספרים:", error);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
});

module.exports = router;
