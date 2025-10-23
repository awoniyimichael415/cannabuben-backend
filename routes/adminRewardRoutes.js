const express = require("express");
const router = express.Router();
const Reward = require("../models/Reward");
const { verifyAdmin } = require("../middleware/adminMiddleware");

// List all rewards
router.get("/", verifyAdmin, async (_req, res) => {
  const rewards = await Reward.find().sort({ createdAt: -1 });
  res.json({ success: true, rewards });
});

// Create / Update
router.post("/", verifyAdmin, async (req, res) => {
  const { id, ...data } = req.body;
  let reward = id ? await Reward.findByIdAndUpdate(id, data, { new: true }) : await Reward.create(data);
  res.json({ success: true, reward });
});

// Delete
router.delete("/:id", verifyAdmin, async (req, res) => {
  await Reward.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
