const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//require("dotenv").config();



const User = require("./models/userModel");
const bookRoutes = require("./routes/books");
const donatedBooksRouter = require("./routes/donatedBooks");
const reservedBooksRoutes = require("./routes/reservedBooks");
const autoReleaseReservations = require("./utils/autoReleaseReservations"); // ✅ חדש!

const app = express();

// 📢 אמצעים
app.use(cors());
app.use(express.json());

// 📢 התחברות למונגו (שינוי כאן)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 📢 בדיקה בכל בקשה אם יש ספרים שפג תוקפם
app.use(async (req, res, next) => {
  await autoReleaseReservations();
  next();
});

// 📢 ניהול ספרים קיימים (מאושרים)
app.use("/api/books", bookRoutes);

// 📢 ספרים לתרומה
app.use('/api/donatedBooks', donatedBooksRouter);

// 📢 ספרים משוריינים
app.use('/api/reservedBooks', reservedBooksRoutes);

// 📢 הרשמת משתמשים
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, phone, city } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "האימייל כבר רשום" });

    const newUser = new User({ username, email, password, phone, city });
    await newUser.save();

    res.status(201).json({ message: "ההרשמה הצליחה!" });
  } catch (err) {
    console.error("❌ שגיאה בהרשמה:", err);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

// 📢 כניסת משתמשים
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "האימייל לא נמצא" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "סיסמה שגויה" });
    }

    res.status(200).json({ message: "התחברת בהצלחה", user });
  } catch (err) {
    console.error("❌ שגיאה בכניסה:", err);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

// 📢 הפעלת השרת
app.listen(3001, () => console.log("🚀 Server running on port 3001"));
