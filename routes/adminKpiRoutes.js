const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Card = require("../models/Card");
const mongoose = require("mongoose");
const Tx = mongoose.models.Tx || mongoose.model("Tx");

router.get("/", async (req, res) => {
  try {
    const range = parseInt(req.query.range || "30"); // days: 7, 30, or 0 (all-time)
    const since = range > 0 ? new Date(Date.now() - range * 24 * 3600 * 1000) : new Date(0);

    const [totalUsers, activeUsers, totalCoins, spins, boxes, topCards, latestTx] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: since } }),
      User.aggregate([{ $group: { _id: null, total: { $sum: "$coins" } } }]),
      Tx.countDocuments({ "meta.source": "daily-spin", createdAt: { $gte: since } }),
      Tx.countDocuments({ "meta.source": "mystery-box", createdAt: { $gte: since } }),
      Card.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$name", pulls: { $sum: 1 } } },
        { $sort: { pulls: -1 } },
        { $limit: 5 },
      ]),
      Tx.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({
      success: true,
      data: {
        range,
        totalUsers,
        activeUsers,
        totalCoins: totalCoins[0]?.total || 0,
        spinsUsed: spins,
        boxesOpened: boxes,
        topCards,
        latestTx,
      },
    });
  } catch (err) {
    console.error("KPI fetch error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
