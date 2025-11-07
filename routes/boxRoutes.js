const router = require("express").Router();
const User = require("../models/User");
const Card = require("../models/Card");
const UserCard = require("../models/UserCard");
const Tx = require("../models/Tx");
const BoxConfig = require("../models/BoxConfig");
const { requireAuth } = require("../utils/auth");

// 📦 Card Catalog
const CATALOG = [
  // 🟢 Common (20 cards, ~60%)
  { id: 1,  name: "Mini Leaf Coin", rarity: "Common" },
  { id: 2,  name: "Green Stack", rarity: "Common" },
  { id: 3,  name: "Boost Drop", rarity: "Common" },
  { id: 4,  name: "Sun Sprout", rarity: "Common" },
  { id: 5,  name: "Leafy Charm", rarity: "Common" },
  { id: 6,  name: "Coin Sprig", rarity: "Common" },
  { id: 7,  name: "Happy Bud", rarity: "Common" },
  { id: 8,  name: "Bloom Token", rarity: "Common" },
  { id: 9,  name: "Seed Starter", rarity: "Common" },
  { id: 10, name: "Lucky Clover", rarity: "Common" },
  { id: 11, name: "Small Glow", rarity: "Common" },
  { id: 12, name: "Fresh Mint", rarity: "Common" },
  { id: 13, name: "Green Essence", rarity: "Common" },
  { id: 14, name: "Coin Sprout", rarity: "Common" },
  { id: 15, name: "Herb Spark", rarity: "Common" },
  { id: 16, name: "Leaf Drop", rarity: "Common" },
  { id: 17, name: "Tiny Bloom", rarity: "Common" },
  { id: 18, name: "Mini Shroom", rarity: "Common" },
  { id: 19, name: "Little Stone", rarity: "Common" },
  { id: 20, name: "Herbal Dust", rarity: "Common" },

  // 🔵 Rare (8 cards, ~25%)
  { id: 21, name: "Coin Storm", rarity: "Rare" },
  { id: 22, name: "Energy Boost", rarity: "Rare" },
  { id: 23, name: "Spin Token", rarity: "Rare" },
  { id: 24, name: "Grovi Gem", rarity: "Rare" },
  { id: 25, name: "Power Leaf", rarity: "Rare" },
  { id: 26, name: "Glow Dust", rarity: "Rare" },
  { id: 27, name: "Root Crystal", rarity: "Rare" },
  { id: 28, name: "Chroma Vine", rarity: "Rare" },

  // 🟣 Epic (3 cards, ~10%)
  { id: 29, name: "Leaf Wizard", rarity: "Epic" },
  { id: 30, name: "Chilltoad", rarity: "Epic" },
  { id: 31, name: "Time Sprout", rarity: "Epic" },

  // 🟡 Legendary (2 cards, ~5%)
  { id: 32, name: "Grovi Spirit", rarity: "Legendary" },
  { id: 33, name: "Golden Guardian", rarity: "Legendary" },
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

/* ============================================================
   🎁 OPEN BOX – Drops Card + Adds Coin Reward (MVP Spec)
============================================================ */
router.post("/open", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.boxes || user.boxes <= 0)
      return res.status(400).json({ error: "No boxes available" });

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

    // 🪙 Reward per rarity (from Grovi MVP)
    const rarityRewards = {
      Common: 1,
      Rare: 3,
      Epic: 10,
      Legendary: 25,
    };
    const rewardCoins = rarityRewards[rarity] || 0;

    // Create card record
    await Card.create({
      userId: user._id,
      name: drop.name,
      rarity: drop.rarity,
      coinsEarned: rewardCoins,
      cardId: drop.id,
    });

    // Update user stats
    user.boxes -= 1;
    user.boxesOpened = (user.boxesOpened || 0) + 1;
    user.coins = (user.coins || 0) + rewardCoins;
    await user.save();

    // Log transaction for Admin analytics
    await Tx.create({
      userId: user._id,
      orderId: `BOX-${Date.now()}`,
      coins: rewardCoins,
      meta: { source: "box-open", rarity, cardName: drop.name },
    });

    res.json({
      success: true,
      card: drop,
      boxesLeft: user.boxes,
      rewardCoins,
      totalCoins: user.coins,
    });
  } catch (e) {
    console.error("Box open error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   🔥 BURN CARD -> Convert to Coins
============================================================ */
router.post("/burn", requireAuth, async (req, res) => {
  try {
    const { cardMongoId } = req.body;
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
    console.error("Burn error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   ⚗️ FUSE CARDS -> Upgrade Rarity
============================================================ */
router.post("/fuse", requireAuth, async (req, res) => {
  try {
    const { rarity } = req.body;
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

    res.json({
      success: true,
      fusedInto: {
        id: minted._id,
        cardId: drop.id,
        name: drop.name,
        rarity: drop.rarity,
      },
    });
  } catch (e) {
    console.error("Fuse error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   🃏 GET USER CARDS (for Dashboard & Cards pages)
============================================================ */
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
<<<<<<< HEAD
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const cards = await Card.find({ userId: user._id }).sort({ createdAt: -1 });

    res.json({ success: true, cards });
=======
    if (!email)
      return res.status(400).json({ success: false, error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User not found" });

    // 🟢 Get game cards (from box/spin)
    const gameCards = await Card.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    // 🧩 Get strain cards (from orders)
    const strainCards = await UserCard.find({
      userId: user._id,
      source: "order",
    })
      .populate("cardId", "name rarity imageUrl")
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Combine both
    const allCards = [
      ...strainCards.map((c) => ({
        name: c.cardId?.name,
        rarity: c.cardId?.rarity,
        image: c.cardId?.imageUrl,
        source: "order", // mark as Strain
      })),
      ...gameCards.map((c) => ({
        name: c.name,
        rarity: c.rarity,
        image: c.imageUrl || null,
        source: "game", // keep your existing cards normal
      })),
    ];

    res.json({ success: true, cards: allCards });
>>>>>>> e8497bc (🚀 Ban system update: auto logout + global enforce)
  } catch (e) {
    console.error("Fetch cards error:", e);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
