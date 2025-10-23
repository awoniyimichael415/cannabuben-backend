const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// ✅ Reward Schema
const rewardSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    cost: Number,
    stock: Number,
    limitPerUser: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const Reward = mongoose.models.Reward || mongoose.model("Reward", rewardSchema);

// ✅ GET all rewards
router.get("/", async (req, res) => {
  try {
    const rewards = await Reward.find({}).sort({ createdAt: -1 });
    res.json({ success: true, rewards });
  } catch (err) {
    console.error("Fetch rewards error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ✅ CREATE new reward
router.post("/", async (req, res) => {
  try {
    const { title, description, cost, stock, limitPerUser } = req.body;
    if (!title || !cost) return res.status(400).json({ success: false, error: "Missing fields" });
    const reward = await Reward.create({ title, description, cost, stock, limitPerUser });
    res.json({ success: true, reward });
  } catch (err) {
    console.error("Create reward error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ✅ UPDATE reward
router.put("/:id", async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reward) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, reward });
  } catch (err) {
    console.error("Update reward error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ✅ DELETE reward
router.delete("/:id", async (req, res) => {
  try {
    await Reward.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete reward error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
