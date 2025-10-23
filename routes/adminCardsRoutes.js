const express = require("express");
const jwt = require("jsonwebtoken");
const Card = require("../models/Card");
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

// ===== Get All Cards =====
router.get("/", verifyAdmin, async (req, res) => {
  const cards = await Card.find().sort({ createdAt: -1 });
  res.json({ success: true, cards });
});

// ===== Add New Card =====
router.post("/", verifyAdmin, async (req, res) => {
  const card = await Card.create(req.body);
  res.json({ success: true, card });
});

// ===== Update Card =====
router.put("/:id", verifyAdmin, async (req, res) => {
  const card = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, card });
});

// ===== Delete Card =====
router.delete("/:id", verifyAdmin, async (req, res) => {
  await Card.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
