require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Import Models
const User = require("./models/User.js");
const Card = require("./models/Card.js");
const SpinConfig = require("./models/SpinConfig.js");
const BoxConfig = require("./models/BoxConfig.js");
const Reward = require("./models/Reward.js");

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes.js");
const gameRoutes = require("./routes/gameRoutes.js");
const spinRoutes = require("./routes/spinRoutes.js");
const boxRoutes = require("./routes/boxRoutes.js");
const rewardRoutes = require("./routes/rewardRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

// ✅ Middleware
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(cors());
app.use(express.json());

// ✅ Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/spin", spinRoutes);
app.use("/api/box", boxRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/admin", adminRoutes);

// ✅ MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/cannabuben";

mongoose.set("strictQuery", true);
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

/* =====================================================
   👤 USER PROFILE LOOKUP (for dashboard, games)
===================================================== */
app.get("/api/user", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "email is required" });

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    return res.json({ email, coins: 0, boxes: 0, spinTickets: 0, spinsUsed: 0 });
  }

  res.json({
    email: user.email,
    coins: user.coins,
    name: user.name || "",
    avatar: user.avatar || null,
    boxes: user.boxes || 0,
    spinTickets: user.spinTickets || 0,
    spinsUsed: user.spinsUsed || 0,
  });
});

/* =====================================================
   ✏️ Update Profile
===================================================== */
app.post("/api/auth/update-profile", async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
   🩺 Health Check
===================================================== */
app.get("/health", (req, res) => res.send("OK"));
app.get("/", (req, res) => res.send("✅ CannaBuben backend is running fine!"));

/* =====================================================
   🚀 Start Server
===================================================== */
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
