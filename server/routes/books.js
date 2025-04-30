const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

// ✅ ניקוי רווחים, מקפים, ואפסים - קיצוץ ספרת ביקורת רק אם יש צורך
const cleanBarcode = (barcode) => {
  const cleaned = barcode.replace(/\s|-/g, "").replace(/0/g, "");
  return cleaned.length >= 10 ? cleaned.slice(0, -1) : cleaned;
};

router.get("/barcode/:barcode", async (req, res) => {
  const raw = req.params.barcode;
  const cleaned = cleanBarcode(raw);
  const cleanedNumber = Number(cleaned);

  console.log("📥 barcode raw:", raw);
  console.log("🔍 cleaned barcode:", cleaned);
  console.log("🔢 parsed to number:", cleanedNumber);

  try {
    // 🔎 נסה לחפש לפי מספר
    let book = await Book.findOne({ barcode: cleanedNumber });

    // ❗אם לא נמצא - נסה כמחרוזת
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
      res.status(404).json({ error: "Book not found" });
    }
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
