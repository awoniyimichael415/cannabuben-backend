const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Card = require("../models/Card");

const router = express.Router();

/* =====================================================
   ✅ Middleware — Verify Admin Token
===================================================== */
function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: "Missing token" });

    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET || "dev_admin_secret");
    if (payload?.role !== "admin") return res.status(403).json({ success: false, error: "Not an admin" });

    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid/expired token" });
  }
}

/* =====================================================
   🔐 Admin Login
===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ success: false, error: "Email and password required" });

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
    const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || "";
    const SECRET = process.env.ADMIN_JWT_SECRET || "dev_admin_secret";
    const EXPIRES = process.env.ADMIN_JWT_EXPIRES || "7d";

    if (email.trim().toLowerCase() !== ADMIN_EMAIL.trim().toLowerCase())
      return res.status(401).json({ success: false, error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, ADMIN_HASH);
    if (!ok) return res.status(401).json({ success: false, error: "Invalid credentials" });

    const token = jwt.sign({ role: "admin", email: ADMIN_EMAIL }, SECRET, { expiresIn: EXPIRES });
    return res.json({ success: true, token, admin: { email: ADMIN_EMAIL, role: "admin" } });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* =====================================================
   📊 Dashboard KPIs / Overview
===================================================== */
router.get("/kpis", requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = totalUsers; // Placeholder
    const totalCoinsAgg = await User.aggregate([{ $group: { _id: null, total: { $sum: "$coins" } } }]);
    const totalCoins = totalCoinsAgg[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalCoins,
        spinsUsed: 200,
        boxesOpened: 100,
        topCards: [
          { _id: "Gold Rush", pulls: 24 },
          { _id: "Purple Dream", pulls: 20 },
        ],
        latestTx: [
          { meta: { source: "daily-spin" }, coins: 25 },
          { meta: { source: "purchase" }, coins: 100 },
        ],
      },
    });
  } catch (err) {
    console.error("KPI error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* =====================================================
   👥 Users
===================================================== */
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "email name coins createdAt").sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, users });
  } catch {
    res.status(500).json({ success: false, error: "Failed to load users" });
  }
});

/* =====================================================
   🎁 Rewards
===================================================== */
router.get("/rewards", requireAdmin, (req, res) => {
  const rewards = [
    { _id: "1", title: "10% Discount", cost: 100, stock: 20 },
    { _id: "2", title: "Mystery Box", cost: 250, stock: 10 },
  ];
  res.json({ success: true, rewards });
});

/* =====================================================
   💳 Transactions
===================================================== */
router.get("/transactions", requireAdmin, (req, res) => {
  const txs = [
    { id: "1", email: "user1@mail.com", coins: 20, type: "spin", date: new Date() },
    { id: "2", email: "user2@mail.com", coins: 50, type: "purchase", date: new Date() },
  ];
  res.json({ success: true, txs });
});

/* =====================================================
   🃏 Cards
===================================================== */
router.get("/cards", requireAdmin, async (req, res) => {
  try {
    const cards = await Card.find()
      .populate("userId", "email name")
      .sort({ createdAt: -1 })
      .limit(300);
    res.json({
      success: true,
      cards: cards.map((c) => ({
        id: c._id,
        user: c.userId ? c.userId.email : "—",
        name: c.name,
        rarity: c.rarity,
        coinsEarned: c.coinsEarned || 0,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    console.error("Admin cards error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* =====================================================
   🎮 Games Config
===================================================== */
router.get("/games", requireAdmin, (req, res) => {
  res.json({
    success: true,
    spin: { "+1 Coin": "45%", "+5 Coins": "25%", "+10 Coins": "15%", "+25 Coins": "10%", "Mystery Box": "5%" },
    box: { Common: "60%", Rare: "25%", Epic: "10%", Legendary: "5%" },
  });
});

/* =====================================================
   📈 Analytics
===================================================== */
router.get("/analytics", requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCards = await Card.countDocuments();
    res.json({
      success: true,
      analytics: {
        users: totalUsers,
        cards: totalCards,
        retention: "82%",
        dailySpins: 140,
        topReward: "Mystery Box",
      },
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* =====================================================
   ⚙️ Settings
===================================================== */
router.get("/settings", requireAdmin, (req, res) => {
  res.json({
    success: true,
    settings: {
      version: "1.0.0",
      maintenance: false,
      environment: process.env.NODE_ENV || "development",
      spinCooldown: "24h",
      premiumSpinCooldown: "6h",
    },
  });
});

module.exports = router;
