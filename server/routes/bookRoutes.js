const express = require("express");
const router = express.Router();
const Book = require("../models/bookModel");

// Clean spaces, hyphens, and zeros - trim check digit only if needed
const cleanBarcode = (barcode) => {
  const cleaned = barcode.replace(/\s|-/g, "").replace(/0/g, "");
  return cleaned.length >= 10 ? cleaned.slice(0, -1) : cleaned;
};

router.get("/barcode/:barcode", async (req, res) => {
  const raw = req.params.barcode;
  const cleaned = cleanBarcode(raw);
  const cleanedNumber = Number(cleaned);

  console.log("📥 ברקוד גולמי:", raw);
  console.log("🔍 ברקוד לאחר ניקוי:", cleaned);
  console.log("🔢 המרה למספר:", cleanedNumber);

  try {
    // Try to find by number
    let book = await Book.findOne({ barcode: cleanedNumber });

    // If not found - try as string
    if (!book) {
      book = await Book.findOne({ barcode: cleaned });
      if (book) console.log("🔁 נמצא לפי מחרוזת!");
    }

    if (book) {
      res.json({
        title: book.title,
        author: book.author,
        grade: book.grade,
        barcode: book.barcode
      });
    } else {
      console.log("❌ הספר לא נמצא במסד הנתונים");
      res.status(404).json({ error: "הספר לא נמצא" });
    }
  } catch (err) {
    console.error("❌ שגיאת שרת:", err);
    res.status(500).json({ error: "שגיאת שרת" });
  }
});

module.exports = router;


// Get all approved books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    console.error("❌ שגיאה בשליפת ספרים:", err);
    res.status(500).json({ error: "שגיאה בשליפת ספרים" });
  }
});
