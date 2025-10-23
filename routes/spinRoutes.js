const router = require("express").Router();
const crypto = require("crypto");
const User = require("../models/User");
const Tx = require("../models/Tx");
const SpinConfig = require("../models/SpinConfig");
const { requireAuth } = require("../utils/auth");

function weightedRoll(weights) {
  const total = weights.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const w of weights) {
    if ((r -= w.weight) <= 0) return w;
  }
  return weights[weights.length - 1];
}
const hoursBetween = (a, b) => (a - b) / 36e5;

router.post("/", requireAuth, async (req, res) => {
  try {
    const mode = req.body.mode === "premium" ? "premium" : "free";
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const cfg = await SpinConfig.findOne({ isPublished: true }).sort({ updatedAt: -1 });
    const freeCD = cfg?.freeCooldownHours ?? 24;
    const premiumCD = cfg?.premiumCooldownHours ?? 6;

    const now = new Date();
    if (mode === "free" && user.lastFreeSpinAt && hoursBetween(now, user.lastFreeSpinAt) < freeCD) {
      const left = Math.ceil((freeCD - hoursBetween(now, user.lastFreeSpinAt)) * 60);
      return res.status(429).json({ error: `Free spin cooldown: ${left} min left` });
    }
    if (mode === "premium" && user.lastPremiumSpinAt && hoursBetween(now, user.lastPremiumSpinAt) < premiumCD) {
      const left = Math.ceil((premiumCD - hoursBetween(now, user.lastPremiumSpinAt)) * 60);
      return res.status(429).json({ error: `Premium spin cooldown: ${left} min left` });
    }

    // default weights match your buyer’s logic
    const weights = cfg?.weights?.length
      ? cfg.weights
      : [
          { label: "+1 Coin", type: "coins", value: 1, weight: 45 },
          { label: "+5 Coins", type: "coins", value: 5, weight: 25 },
          { label: "+10 Coins", type: "coins", value: 10, weight: 15 },
          { label: "+25 Coins", type: "coins", value: 25, weight: 10 },
          { label: "Mystery Box", type: "mystery_box", value: 1, weight: 5 },
        ];

    // “fair-ish” RNG seed, logged
    const seed = crypto.createHash("sha256").update(user._id + now.toISOString()).digest("hex");
    const result = weightedRoll(weights);

    let prize = 0;
    let mystery = 0;
    if (result.type === "coins") prize = result.value || 0;
    if (result.type === "mystery_box") mystery = 1;

    user.coins += prize;
    if (mystery) user.boxes = (user.boxes || 0) + 1;
    if (mode === "free") user.lastFreeSpinAt = now;
    else user.lastPremiumSpinAt = now;
    user.spinsUsed = (user.spinsUsed || 0) + 1;
    await user.save();

    await Tx.create({
      userId: user._id,
      type: prize > 0 ? "earn" : "airdrop",
      amount: prize,
      source: "spin",
      meta: { mode, result, seed, mystery },
    });

    return res.json({
      success: true,
      outcome: result.label,
      prize,
      mysteryBoxes: mystery,
      totalCoins: user.coins,
      boxes: user.boxes || 0,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
