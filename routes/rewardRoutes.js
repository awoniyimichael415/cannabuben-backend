const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Reward = require("../models/Reward");
const mongoose = require("mongoose");

// =========================
// Transaction model
// =========================
const Tx =
  mongoose.models.Tx ||
  mongoose.model(
    "Tx",
    new mongoose.Schema(
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        orderId: String,
        coins: Number,
        meta: Object,
      },
      { timestamps: true }
    )
  );

// =========================
// ✅ GET all active rewards (User view)
// =========================
router.get("/all", async (req, res) => {
  try {
    const rewards = await Reward.find({
      status: "active",
      $or: [{ stock: { $gt: 0 } }, { stock: -1 }],
    })
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      rewards: rewards.map((r) => ({
        _id: r._id,
        title: r.title,
        description: r.description || "",
        priceCoins: r.priceCoins,
        imageUrl: r.imageUrl || "",
        stock: r.stock,
        type: r.type,
        terms: r.terms || "",
        featured: r.featured || false,
      })),
    });
  } catch (err) {
    console.error("Rewards fetch error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// =========================
// ✅ POST Redeem a reward
// =========================
router.post("/redeem", async (req, res) => {
  try {
    const { email, rewardId } = req.body;
    if (!email || !rewardId)
      return res.status(400).json({ error: "Email and rewardId required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    const reward = await Reward.findById(rewardId);
    if (!reward || reward.status !== "active")
      return res.status(404).json({ error: "Reward unavailable" });

    // ✅ stock check
    if (typeof reward.stock === "number" && reward.stock !== -1 && reward.stock <= 0)
      return res.status(400).json({ error: "Out of stock" });

    // ✅ coin balance check
    if ((user.coins || 0) < reward.priceCoins)
      return res.status(400).json({ error: "Not enough coins" });

    // ✅ Deduct coins
    user.coins -= reward.priceCoins;

    // ✅ Apply reward effects correctly
    if (reward.type === "mysteryBox") {
      user.boxes = (user.boxes || 0) + 1;
    } else if (reward.type === "spinTicket") {
      user.spinTickets = (user.spinTickets || 0) + 1;
    }
    await user.save();

    // ✅ Decrease stock if finite
    if (typeof reward.stock === "number" && reward.stock !== -1) {
      reward.stock = Math.max(0, reward.stock - 1);
      await reward.save();
    }

    // ✅ Log to Tx for analytics
    await Tx.create({
      userId: user._id,
      orderId: `REDEEM-${Date.now()}`,
      coins: -reward.priceCoins,
      meta: { source: "redeem", reward: reward.title, type: reward.type },
    });

    res.json({
      success: true,
      message: "Reward redeemed successfully!",
      user: {
        coins: user.coins,
        boxes: user.boxes,
        spinTickets: user.spinTickets,
      },
      reward: {
        _id: reward._id,
        title: reward.title,
        type: reward.type,
      },
    });
  } catch (err) {
    console.error("Redeem error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// ✅ GET User Reward Redemption History
// =========================
router.get("/history", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, error: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const history = await Tx.find({ userId: user._id, "meta.source": "redeem" })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, history });
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
