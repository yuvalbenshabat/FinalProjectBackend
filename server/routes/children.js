const express = require("express");
const router = express.Router();
const Child = require("../models/childModel");

// קבלת ילדים של משתמש
router.get("/:userId", async (req, res) => {
  try {
    const children = await Child.find({ userId: req.params.userId });
    res.json(children);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בקבלת ילדים", error: err });
  }
});

// הוספת ילד
router.post("/", async (req, res) => {
  try {
    const { name, grade, userId } = req.body;
    if (!name || !grade || !userId) {
      return res.status(400).json({ message: "חסר שם / כיתה / משתמש" });
    }

    const newChild = new Child({ name, grade, userId });
    await newChild.save();
    res.status(201).json(newChild);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בהוספת ילד", error: err });
  }
});

module.exports = router;
