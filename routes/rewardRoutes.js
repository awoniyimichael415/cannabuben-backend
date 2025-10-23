const router = require("express").Router();
const Reward = require("../models/Reward");
const Redemption = require("../models/Redemption");
const User = require("../models/User");
const Tx = require("../models/Tx");
const { requireAuth } = require("../utils/auth");

router.get("/", async (req, res) => {
  const items = await Reward.find({ status: "active" }).sort({ featured: -1, createdAt: -1 });
  res.json({ success: true, items });
});

router.post("/redeem", requireAuth, async (req, res) => {
  const { rewardId } = req.body;
  const reward = await Reward.findById(rewardId);
  if (!reward || reward.status !== "active") return res.status(404).json({ error: "Not available" });

  const now = new Date();
  if (reward.availableFrom && now < reward.availableFrom) return res.status(400).json({ error: "Not yet available" });
  if (reward.availableTo && now > reward.availableTo) return res.status(400).json({ error: "Expired" });

  const user = await User.findById(req.user.id);
  if (user.coins < reward.priceCoins) return res.status(400).json({ error: "Not enough coins" });
  if (reward.stock !== -1 && reward.stock <= 0) return res.status(400).json({ error: "Out of stock" });

  user.coins -= reward.priceCoins;
  await user.save();

  if (reward.stock !== -1) {
    reward.stock -= 1;
    await reward.save();
  }

  await Redemption.create({ userId: user._id, rewardId, costCoins: reward.priceCoins, status: "completed" });
  await Tx.create({ userId: user._id, type: "spend", amount: reward.priceCoins, source: "redeem", meta: { rewardId } });

  res.json({ success: true, totalCoins: user.coins });
});

module.exports = router;
