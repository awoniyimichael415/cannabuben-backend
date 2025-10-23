const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Tx = mongoose.models.Tx || mongoose.model("Tx");

// ✅ GET ALL TRANSACTIONS (Admin)
router.get("/", async (req, res) => {
  try {
    const txs = await Tx.find({})
      .populate("userId", "email name")
      .sort({ createdAt: -1 })
      .limit(200); // limit for performance, adjust if needed

    res.json({
      success: true,
      count: txs.length,
      txs: txs.map((t) => ({
        id: t._id,
        email: t.userId?.email || "—",
        name: t.userId?.name || "",
        coins: t.coins,
        orderId: t.orderId,
        type: t.meta?.source || (t.meta?.rawOrder ? "Order" : "Unknown"),
        date: t.createdAt,
      })),
    });
  } catch (err) {
    console.error("Admin fetch transactions error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
