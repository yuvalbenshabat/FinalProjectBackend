const express = require("express");
const router = express.Router();
const Wishlist = require("../models/wishlistModel");

// קבל את כל הספרים של ילד מסוים לפי childId
router.get("/:childId", async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ childId: req.params.childId });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בקבלת רשימת משאלות", error: err });
  }
});

// הוסף ספר לרשימת משאלות
router.post("/", async (req, res) => {
  try {
    const { childId, title, author } = req.body;
    if (!childId || !title || !author)
      return res.status(400).json({ message: "חסר מידע בספר" });

    const newBook = new Wishlist({ childId, title, author });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בהוספת ספר", error: err });
  }
});

// מחק ספר לפי מזהה
router.delete("/:id", async (req, res) => {
  try {
    await Wishlist.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "שגיאה במחיקת ספר", error: err });
  }
});

module.exports = router;
