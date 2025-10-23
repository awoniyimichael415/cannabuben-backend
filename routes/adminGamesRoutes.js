const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || "fallback_secret";

// Middleware
function verifyAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, error: "Missing token" });

  try {
    const decoded = jwt.verify(token, ADMIN_SECRET);
    if (decoded.role !== "admin") throw new Error("Invalid role");
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}

// Mock settings for now
let spinConfig = {
  "+1": 45, "+5": 25, "+10": 15, "+25": 10, "Mystery Box": 5,
  cooldowns: { free: "24h", premium: "6h" }
};

let boxConfig = {
  Common: 60, Rare: 25, Epic: 10, Legendary: 5,
  burnValues: { Common: 1, Rare: 3, Epic: 10, Legendary: 25 }
};

// ===== GET Spin Config =====
router.get("/spin", verifyAdmin, (req, res) => res.json({ success: true, config: spinConfig }));

// ===== UPDATE Spin Config =====
router.put("/spin", verifyAdmin, (req, res) => {
  spinConfig = { ...spinConfig, ...req.body };
  res.json({ success: true, config: spinConfig });
});

// ===== GET Box Config =====
router.get("/box", verifyAdmin, (req, res) => res.json({ success: true, config: boxConfig }));

// ===== UPDATE Box Config =====
router.put("/box", verifyAdmin, (req, res) => {
  boxConfig = { ...boxConfig, ...req.body };
  res.json({ success: true, config: boxConfig });
});

module.exports = router;
