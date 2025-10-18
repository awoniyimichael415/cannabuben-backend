// backend/routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Register (for WooCommerce users without password yet)
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const emailLc = String(email).toLowerCase().trim();
    let user = await User.findOne({ email: emailLc });

    if (user && user.password) {
      return res.status(400).json({ error: "User already has a password. Please log in." });
    }

    if (!user) {
      // Create a new user record (e.g., if webhook hasn't created it yet)
      user = new User({ email: emailLc, coins: 0 });
    }

    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ success: true, token, user: { email: user.email, coins: user.coins } });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const emailLc = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: emailLc });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.password) return res.status(400).json({ error: "No password set. Please register first." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ success: true, token, user: { email: user.email, coins: user.coins } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Me (get current user by token)
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ success: true, user: { email: user.email, coins: user.coins } });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
