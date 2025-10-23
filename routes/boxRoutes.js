const router = require("express").Router();
const User = require("../models/User");
const Card = require("../models/Card"); // your existing inventory
const Tx = require("../models/Tx");
const BoxConfig = require("../models/BoxConfig");
const { requireAuth } = require("../utils/auth");

// Catalog for drops (expand later or move to DB)
const CATALOG = [
  { id: 1,  name: "Mini Leaf Coin", rarity: "Common" },
  { id: 2,  name: "Green Stack",    rarity: "Common" },
  { id: 3,  name: "Boost Drop",     rarity: "Common" },

  { id: 11, name: "Coin Storm",     rarity: "Rare" },
  { id: 12, name: "Energy Boost",   rarity: "Rare" },
  { id: 13, name: "Spin Token",     rarity: "Rare" },
  { id: 14, name: "Grovi Gem",      rarity: "Rare" },

  { id: 21, name: "Leaf Wizard",    rarity: "Epic" },
  { id: 22, name: "Chilltoad",      rarity: "Epic" },
  { id: 23, name: "Time Sprout",    rarity: "Epic" },

  { id: 31, name: "Grovi Spirit",   rarity: "Legendary" },
  { id: 32, name: "Golden Guardian",rarity: "Legendary" },
];

const rarityLadder = ["Common", "Rare", "Epic", "Legendary"];
const burnValue = (rar) =>
  rar === "Common" ? 1 : rar === "Rare" ? 3 : rar === "Epic" ? 10 : 25;

function rollRarity(pools) {
  const total = pools.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of pools) {
    if ((r -= p.weight) <= 0) return p.rarity;
  }
  return pools[pools.length - 1].rarity;
}

router.post("/open", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.boxes || user.boxes <= 0) return res.status(400).json({ error: "No boxes available" });

    const cfg = await BoxConfig.findOne({ isPublished: true }).sort({ updatedAt: -1 });
    const pools = cfg?.pools?.length
      ? cfg.pools
      : [
          { rarity: "Common", weight: 0.6 },
          { rarity: "Rare", weight: 0.25 },
          { rarity: "Epic", weight: 0.1 },
          { rarity: "Legendary", weight: 0.05 },
        ];

    const rarity = rollRarity(pools);
    const pool = CATALOG.filter((c) => c.rarity === rarity);
    const drop = pool[Math.floor(Math.random() * pool.length)];

    await Card.create({
      userId: user._id,
      name: drop.name,
      rarity: drop.rarity,
      coinsEarned: 0,  // not adding coins on drop
      cardId: drop.id,
    });

    user.boxes -= 1;
    await user.save();

    await Tx.create({
      userId: user._id,
      type: "airdrop",
      amount: 0,
      source: "mystery_box",
      meta: { drop },
    });

    res.json({ success: true, card: drop, boxesLeft: user.boxes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// Burn one card -> coins
router.post("/burn", requireAuth, async (req, res) => {
  try {
    const { cardMongoId } = req.body; // Card._id
    const card = await Card.findOne({ _id: cardMongoId, userId: req.user.id });
    if (!card) return res.status(404).json({ error: "Card not found" });

    const user = await User.findById(req.user.id);
    const add = burnValue(card.rarity);
    await Card.deleteOne({ _id: card._id });

    user.coins += add;
    await user.save();

    await Tx.create({
      userId: user._id,
      type: "earn",
      amount: add,
      source: "burn",
      meta: { cardId: card.cardId, rarity: card.rarity },
    });

    res.json({ success: true, added: add, totalCoins: user.coins });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// Fuse 3 cards of same rarity -> 1 card of next rarity
router.post("/fuse", requireAuth, async (req, res) => {
  try {
    const { rarity } = req.body; // "Common" -> produce "Rare"
    const toIndex = rarityLadder.indexOf(rarity) + 1;
    const toRarity = rarityLadder[toIndex];
    if (!toRarity) return res.status(400).json({ error: "Cannot fuse highest rarity" });

    const owned = await Card.find({ userId: req.user.id, rarity }).limit(3);
    if (owned.length < 3) return res.status(400).json({ error: "Need 3 cards to fuse" });

    await Card.deleteMany({ _id: { $in: owned.map((o) => o._id) } });

    const pool = CATALOG.filter((c) => c.rarity === toRarity);
    const drop = pool[Math.floor(Math.random() * pool.length)];

    const minted = await Card.create({
      userId: req.user.id,
      name: drop.name,
      rarity: drop.rarity,
      coinsEarned: 0,
      cardId: drop.id,
    });

    res.json({ success: true, fusedInto: { id: minted._id, cardId: drop.id, name: drop.name, rarity: drop.rarity } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
