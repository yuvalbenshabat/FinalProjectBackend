// 📁 נתיב: /server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { isValidObjectId } = mongoose;  // Import only what we need
require("dotenv").config();

const User = require("./models/userModel");
const Message = require("./models/messageModel");
const bookRoutes = require("./routes/bookRoutes");
const donatedBooksRouter = require("./routes/donatedBookRoutes");
const reservedBooksRoutes = require("./routes/reservedBookRoutes");
const autoReleaseReservations = require("./utils/autoReleaseReservations");
const childRoutes = require("./routes/childRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

// Common error response
const SERVER_ERROR = { message: "שגיאה בשרת" };
// Common user projection
const USER_PROJECTION = "username city _id";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://finalproject-frontend-ncn5.onrender.com",
    methods: ["GET", "POST"],
  },
});

// 🟢 Socket.IO - ניהול צ'אט
io.on("connection", (socket) => {
  console.log("🟢 משתמש התחבר:", socket.id);

  socket.on("join_private_chat", ({ userId, otherUserId }) => {
    const roomId = [userId, otherUserId].sort().join("_");
    socket.join(roomId);
    console.log(`➡️ ${userId} הצטרף לחדר: ${roomId}`);
  });

  socket.on("send_private_message", async ({ roomId, message, sender }) => {
    const msgData = {
      roomId,
      sender,
      message,
      timestamp: new Date().toISOString(),
    };

    console.log(`✉️ ${sender} שלח הודעה לחדר ${roomId}: "${message}"`);

    io.to(roomId).emit("receive_private_message", msgData);

    try {
      await Message.create(msgData);
      console.log("✅ ההודעה נשמרה למסד הנתונים");
    } catch (err) {
      console.error("❌ שגיאה בשמירת הודעה למסד הנתונים:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 משתמש התנתק:", socket.id);
  });
});

// 🟢 אמצעים
app.use(cors());
app.use(express.json());

// 🟢 התחברות למסד הנתונים
console.log("🔍 מנסה להתחבר ל-MongoDB עם URI:", process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🟢 בדיקה אם יש הזמנות שפג תוקפן
app.use(async (req, res, next) => {
  await autoReleaseReservations();
  next();
});

// 🟢 ניתוב
app.use("/api/books", bookRoutes);
app.use("/api/donatedBooks", donatedBooksRouter);
app.use("/api/reservedBooks", reservedBooksRoutes);
app.use("/api/children", childRoutes);
app.use("/api/wishlist", wishlistRoutes);

// ✅ שליפת משתמשים
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, USER_PROJECTION);
    res.json(users);
  } catch (err) {
    console.error("❌ שגיאה בשליפת משתמשים:", err);
    res.status(500).json(SERVER_ERROR);
  }
});

// ✅ שליפת כל חדרי השיחה של משתמש
app.get("/api/messages/user/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const rooms = await Message.find({ sender: username }).distinct("roomId");
    res.json(rooms);
  } catch (err) {
    console.error("❌ שגיאה בשליפת חדרים לפי משתמש:", err);
    res.status(500).json(SERVER_ERROR);
  }
});

// ✅ שליפת כל ההודעות של חדר
app.get("/api/messages/room/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({
      timestamp: 1,
    });
    res.json(messages);
  } catch (err) {
    console.error("❌ שגיאה בשליפת הודעות לפי חדר:", err);
    res.status(500).json(SERVER_ERROR);
  }
});

// ✅ שליפת שיחות אחרונות לפי משתמש
app.get("/api/messages/:username", async (req, res) => {
  try {
    const { username } = req.params;
    console.log("🔍 מחפש שיחות עבור משתמש:", username);

    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ משתמש לא נמצא:", username);
      return res.status(404).json({ message: "משתמש לא נמצא" });
    }
    console.log("✅ משתמש נמצא:", user._id);

    const myId = user._id.toString();
    const messages = await Message.find({ roomId: { $regex: myId } });
    console.log("📨 נמצאו הודעות:", messages.length);

    const roomIds = [...new Set(messages.map((msg) => msg.roomId))];
    console.log("🏠 חדרי צ'אט:", roomIds);

    const userIds = roomIds
      .map((rid) => {
        const ids = rid.split("_");
        const otherId = ids.find((id) => id !== myId);
        try {
          return isValidObjectId(otherId) ? otherId : null;
        } catch (err) {
          console.error("❌ ID לא תקין:", otherId);
          return null;
        }
      })
      .filter(Boolean);

    console.log("👥 משתמשים אחרים:", userIds);

    const users = await User.find(
      { _id: { $in: userIds } },
      USER_PROJECTION
    );
    console.log("✅ נמצאו משתמשים:", users.length);

    res.json(users);
  } catch (err) {
    console.error("❌ שגיאה בשליפת שיחות אחרונות:", err);
    res.status(500).json(SERVER_ERROR);
  }
});

// 🟢 הרשמה – כולל מיקום
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, phone, city, location } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "האימייל כבר רשום" });

    const newUser = new User({
      username,
      email,
      password,
      phone,
      city,
      location: {
        lat: location?.lat || null,
        lng: location?.lng || null,
      },
    });

    await newUser.save();
    res.status(201).json({ message: "ההרשמה הצליחה!" });
  } catch (err) {
    console.error("❌ שגיאה בהרשמה:", err);
    res.status(500).json(SERVER_ERROR);
  }
});

// 🟢 התחברות
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("📥 ניסיון התחברות:", { email });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "האימייל לא נמצא" });
    if (user.password !== password)
      return res.status(401).json({ message: "סיסמה שגויה" });

    res.status(200).json({ message: "התחברת בהצלחה", user });
  } catch (err) {
    console.error("❌ שגיאה בכניסה:", err);
    res.status(500).json(SERVER_ERROR);
  }
});

// ✅ הפעלת השרת
//server.listen(3001, () => console.log("🚀 Server + Socket.IO running on port 3001"));
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));