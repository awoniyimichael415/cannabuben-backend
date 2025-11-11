const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const Card = require("../models/Card");
const Reward = require("../models/Reward");
const SpinConfig = require("../models/SpinConfig");
const BoxConfig = require("../models/BoxConfig");
const ProductCardMap = require("../models/ProductCardMap");
const UserCard = require("../models/UserCard");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


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

const router = express.Router();

/* =====================================================
   ✅ Middleware — Verify Admin Token
===================================================== */
function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token)
      return res.status(401).json({ success: false, error: "Missing token" });

    const payload = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET || "dev_admin_secret"
    );
    if (payload?.role !== "admin")
      return res.status(403).json({ success: false, error: "Not an admin" });

    req.admin = payload;
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, error: "Invalid or expired token" });
  }
}

/* =====================================================
   🔐 Admin Login
===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, error: "Email and password required" });

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
    const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || "";
    const SECRET = process.env.ADMIN_JWT_SECRET || "dev_admin_secret";
    const EXPIRES = process.env.ADMIN_JWT_EXPIRES || "7d";

    if (email.trim().toLowerCase() !== ADMIN_EMAIL.trim().toLowerCase())
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, ADMIN_HASH);
    if (!ok)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    const token = jwt.sign({ role: "admin", email: ADMIN_EMAIL }, SECRET, {
      expiresIn: EXPIRES,
    });
    return res.json({
      success: true,
      token,
      admin: { email: ADMIN_EMAIL, role: "admin" },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* =====================================================
   📊 Dashboard KPIs — With Date Filter
===================================================== */
router.get("/kpis", requireAdmin, async (req, res) => {
  try {
    const range = Number(req.query.range || 0);
    const now = new Date();
    let startDate = null;
    if (range === 7) startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (range === 30) startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: startDate || new Date(0) },
    });

    const totalCoinsAgg = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$coins" } } },
    ]);
    const totalCoins = totalCoinsAgg[0]?.total || 0;

    const spinsUsedAgg = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$spinsUsed" } } },
    ]);
    const boxesOpenedAgg = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$boxesOpened" } } },
    ]);

    const coinsIssuedAgg = await Tx.aggregate([
      { $match: { coins: { $gt: 0 }, ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$coins" } } },
    ]);
    const coinsBurnedAgg = await Tx.aggregate([
      { $match: { coins: { $lt: 0 }, ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$coins" } } },
    ]);

    const topCards = await Card.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const latestTx = await Tx.find(dateFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "email");

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalCoins,
        spinsUsed: spinsUsedAgg[0]?.total || 0,
        boxesOpened: boxesOpenedAgg[0]?.total || 0,
        coinsIssued: coinsIssuedAgg[0]?.total || 0,
        coinsBurned: Math.abs(coinsBurnedAgg[0]?.total || 0),
        topCards,
        latestTx: latestTx.map((t) => ({
          id: t._id,
          email: t.userId?.email || "—",
          coins: t.coins,
          source: t.meta?.source || "unknown",
          createdAt: t.createdAt,
        })),
      },
    });
  } catch (err) {
    console.error("KPI error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* =====================================================
   👥 Users
===================================================== */
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "email name coins banned createdAt").sort({
      createdAt: -1,
    });
    res.json({ success: true, users });
  } catch {
    res.status(500).json({ success: false, error: "Failed to load users" });
  }
});

/* =====================================================
   👮 Adjust User Coins / Ban
===================================================== */
router.put("/users/:id/coins", requireAdmin, async (req, res) => {
  try {
    const { coins, banned } = req.body;
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    if (typeof coins === "number") user.coins = coins;
    if (typeof banned === "boolean") user.banned = banned;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    console.error("Adjust coins error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* =====================================================
   🎁 Rewards CRUD
===================================================== */
router.get("/rewards", requireAdmin, async (req, res) => {
  const rewards = await Reward.find().sort({ createdAt: -1 });
  res.json({ success: true, rewards });
});

router.post("/rewards", requireAdmin, async (req, res) => {
  try {
    const reward = await Reward.create(req.body);
    res.json({ success: true, reward });
  } catch (err) {
    console.error("Create reward error:", err);
    res.status(500).json({ success: false, error: "Failed to create reward" });
  }
});

router.put("/rewards/:id", requireAdmin, async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!reward)
      return res
        .status(404)
        .json({ success: false, error: "Reward not found" });
    res.json({ success: true, reward });
  } catch (err) {
    console.error("Update reward error:", err);
    res.status(500).json({ success: false, error: "Failed to update reward" });
  }
});

router.delete("/rewards/:id", requireAdmin, async (req, res) => {
  try {
    await Reward.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete reward error:", err);
    res.status(500).json({ success: false, error: "Failed to delete reward" });
  }
});

/* =====================================================
   🃏 Strain Cards (Full CRUD + Product → Card Mapping)
   REPLACE existing /cards and mapping related blocks with this single block.
===================================================== */

const safeCardFields = (body = {}) => {
  const out = {};
  if (typeof body.name === "string") out.name = body.name;
  if (typeof body.rarity === "string") out.rarity = body.rarity;
  if (typeof body.coinsEarned !== "undefined") out.coinsEarned = Number(body.coinsEarned) || 0;
  // Accept null/empty to allow removing a mapping
  if (typeof body.productId !== "undefined" && body.productId !== "") {
    out.productId = body.productId === null ? null : Number(body.productId);
  }
  if (typeof body.imageUrl === "string") out.imageUrl = body.imageUrl;
  if (typeof body.active === "boolean") out.active = body.active;
  if (typeof body.description === "string") out.description = body.description;
  if (typeof body.category === "string") out.category = body.category;
  if (typeof body.obtainedFrom === "string") out.obtainedFrom = body.obtainedFrom;
  return out;
}

/* ---------------------------
   GET /api/admin/cards
   returns all cards with productId filled from mapping OR card.productId
   (so admin table always shows product id)
   --------------------------- */
router.get("/cards", requireAdmin, async (req, res) => {
  try {
    const cards = await Card.find().sort({ createdAt: -1 }).lean();
    const mappings = await ProductCardMap.find().lean();

    const merged = cards.map((card) => {
      const match = mappings.find((m) => String(m.cardId) === String(card._id));
      return { ...card, productId: match ? match.productId : (card.productId ?? null) };
    });

    res.json({ success: true, cards: merged });
  } catch (err) {
    console.error("GET /api/admin/cards error:", err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, error: "Failed to load cards" });
  }
});

/* ---------------------------
   POST /api/admin/cards
   Create a card and create mapping if productId provided
   --------------------------- */
router.post("/cards", requireAdmin, async (req, res) => {
  try {
    const data = safeCardFields(req.body);
    if (!data.name) return res.status(400).json({ success: false, error: "Card name required" });

    const card = await Card.create(data);

    // If card.productId exists (admin supplied), ensure mapping points to this card
    if (card.productId != null) {
      await ProductCardMap.findOneAndUpdate(
        { productId: card.productId },
        { productId: card.productId, cardId: card._id, title: card.name, active: true },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, card });
  } catch (err) {
    console.error("POST /api/admin/cards error:", err && err.stack ? err.stack : err);
    if (err && err.code === 11000) {
      return res.status(400).json({ success: false, error: "Duplicate key error (productId maybe already used)" });
    }
    res.status(500).json({ success: false, error: "Failed to create card", detail: err.message });
  }
});

/* ---------------------------
   PUT /api/admin/cards/:id
   Update card; keep mapping in sync: remove old mapping if productId changed
   --------------------------- */
router.put("/cards/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const data = safeCardFields(req.body);

    const existing = await Card.findById(id);
    if (!existing) return res.status(404).json({ success: false, error: "Card not found" });

    const oldProductId = existing.productId ?? null;
    const newProductId = typeof data.productId !== "undefined" ? data.productId : oldProductId;

    // If productId changed and oldProductId existed, delete mapping pointing to old productId
    if (oldProductId && newProductId !== oldProductId) {
      try {
        await ProductCardMap.deleteOne({ productId: oldProductId, cardId: existing._id });
      } catch (delErr) {
        console.warn("Failed to delete old ProductCardMap:", delErr && delErr.message ? delErr.message : delErr);
      }
    }

    // Apply updates to card
    Object.assign(existing, data);
    await existing.save();

    // If newProductId exists, upsert mapping
    if (newProductId != null) {
      await ProductCardMap.findOneAndUpdate(
        { productId: newProductId },
        { productId: newProductId, cardId: existing._id, title: existing.name, active: existing.active ?? true },
        { upsert: true, new: true }
      );
    }

    // If admin cleared productId (set to null), ensure mapping removed
    if (typeof data.productId !== "undefined" && data.productId === null && oldProductId) {
      try {
        await ProductCardMap.deleteOne({ productId: oldProductId, cardId: existing._id });
      } catch (e) {
        console.warn("Failed to delete mapping after clearing productId:", e && e.message ? e.message : e);
      }
    }

    res.json({ success: true, card: existing });
  } catch (err) {
    console.error("PUT /api/admin/cards/:id error:", err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, error: "Failed to update card", detail: err.message });
  }
});

/* ---------------------------
   DELETE /api/admin/cards/:id
   Remove card and any mappings that reference it
   --------------------------- */
router.delete("/cards/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const card = await Card.findByIdAndDelete(id);
    if (!card) return res.status(404).json({ success: false, error: "Card not found" });

    try {
      await ProductCardMap.deleteMany({ cardId: card._id });
    } catch (e) {
      console.warn("Failed to delete ProductCardMap on card delete:", e && e.message ? e.message : e);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/cards/:id error:", err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, error: "Failed to delete card" });
  }
});


/* =====================================================
   💳 Transactions (Real)
===================================================== */
router.get("/transactions", requireAdmin, async (req, res) => {
  try {
    const txs = await Tx.find()
      .populate("userId", "email")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ success: true, txs });
  } catch (err) {
    console.error("Tx fetch error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* =====================================================
   🎮 Game Config — SpinConfig + BoxConfig (Draft / Publish)
   Matches Grovi MVP game logic + admin control
===================================================== */

// helper: get latest by updatedAt
async function getLatestDoc(Model) {
  const doc = await Model.findOne().sort({ updatedAt: -1 });
  if (doc) return doc;
  return null;
}

// GET /api/admin/games
// returns the most recent SpinConfig + BoxConfig (or seeds defaults if empty)
router.get("/games", requireAdmin, async (req, res) => {
  try {
    // 1. SpinConfig
    let spin = await getLatestDoc(SpinConfig);
    if (!spin) {
      spin = await SpinConfig.create({
        rewards: [
          { label: "+1 Coin", coins: 1, box: false, weight: 45 },
          { label: "+5 Coins", coins: 5, box: false, weight: 25 },
          { label: "+10 Coins", coins: 10, box: false, weight: 15 },
          { label: "+25 Coins", coins: 25, box: false, weight: 10 },
          { label: "Mystery Box", coins: 0, box: true, weight: 5 },
        ],
        freeCooldownHours: 24,
        premiumCooldownHours: 6,
        version: 1,
        status: "draft",
        publishedBy: null,
      });
    }

    // 2. BoxConfig
    let box = await getLatestDoc(BoxConfig);
    if (!box) {
      box = await BoxConfig.create({
        weights: {
          Common: 60,
          Rare: 25,
          Epic: 10,
          Legendary: 5,
        },
        cardsPerBox: 1,
        version: 1,
        status: "draft",
        publishedBy: null,
      });
    }

    res.json({
      success: true,
      data: { spin, box },
    });
  } catch (err) {
    console.error("Admin GET /games error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to load game config" });
  }
});

// PUT /api/admin/games
// body expects: { spin: {...}, box: {...}, publish?: boolean }
router.put("/games", requireAdmin, async (req, res) => {
  try {
    const { spin, box, publish } = req.body;
    if (!spin || !box) {
      return res
        .status(400)
        .json({ success: false, error: "Missing spin or box config" });
    }

    // --- Update or create SpinConfig draft ---
    let spinCfg = await getLatestDoc(SpinConfig);
    if (!spinCfg) {
      // if db is empty, create fresh draft
      spinCfg = await SpinConfig.create({
        ...spin,
        status: "draft",
        version: 1,
      });
    } else {
      // merge changes into the latest config doc
      Object.assign(spinCfg, spin);
    }

    // if admin is publishing -> mark published, bump version
    if (publish === true) {
      spinCfg.status = "published";
      spinCfg.version = (spinCfg.version || 1) + 1;
      spinCfg.publishedBy = req.admin.email;
    } else {
      // still editing, keep as draft
      if (spinCfg.status !== "published") {
        spinCfg.status = "draft";
      }
    }

    await spinCfg.save();

    // --- Update or create BoxConfig draft ---
    let boxCfg = await getLatestDoc(BoxConfig);
    if (!boxCfg) {
      boxCfg = await BoxConfig.create({
        ...box,
        status: "draft",
        version: 1,
      });
    } else {
      Object.assign(boxCfg, box);
    }

    if (publish === true) {
      boxCfg.status = "published";
      boxCfg.version = (boxCfg.version || 1) + 1;
      boxCfg.publishedBy = req.admin.email;
    } else {
      if (boxCfg.status !== "published") {
        boxCfg.status = "draft";
      }
    }

    await boxCfg.save();

    // --- Audit log this change ---
    // We already defined recordAdminAction(req, action, entity, entityId, details)
    // earlier in your file. We'll call it here.
    if (typeof recordAdminAction === "function") {
      await recordAdminAction(
        req,
        publish === true ? "Publish Game Config" : "Save Game Config Draft",
        "game_config",
        spinCfg._id?.toString() || "",
        {
          publish,
          spinVersion: spinCfg.version,
          boxVersion: boxCfg.version,
        }
      );
    }

    res.json({
      success: true,
      message: publish === true ? "Config published" : "Draft saved",
      data: {
        spin: spinCfg,
        box: boxCfg,
      },
    });
  } catch (err) {
    console.error("Admin PUT /games error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to update game config" });
  }
});


/* =====================================================
   📈 Analytics — Live Trends
===================================================== */
router.get("/analytics", requireAdmin, async (req, res) => {
  try {
    const signups = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 7 },
    ]);

    const coinsIssuedAgg = await Tx.aggregate([
      { $match: { coins: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$coins" } } },
    ]);
    const coinsBurnedAgg = await Tx.aggregate([
      { $match: { coins: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: "$coins" } } },
    ]);
    const coinsIssued = coinsIssuedAgg[0]?.total || 0;
    const coinsBurned = Math.abs(coinsBurnedAgg[0]?.total || 0);

    const spinsUsed = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$spinsUsed" } } },
    ]);
    const boxesOpened = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$boxesOpened" } } },
    ]);

    const topRewards = await Reward.find({ active: true })
      .sort({ stock: 1 })
      .limit(5)
      .select("title priceCoins stock");

    const topCards = await Card.aggregate([
      { $group: { _id: "$name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      analytics: {
        signups,
        coinsIssued,
        coinsBurned,
        spinsUsed: spinsUsed[0]?.total || 0,
        boxesOpened: boxesOpened[0]?.total || 0,
        topRewards,
        topCards,
      },
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* =====================================================
   ⚙️ SYSTEM SETTINGS + ADMIN AUDIT LOG (Grovi Spec)
   This section implements:
   - Persistent settings model
   - Audit logging for admin actions
   - GET /api/admin/settings
   - PUT /api/admin/settings
   - GET /api/admin/audit
===================================================== */

// -----------------------------
// Settings Schema
// -----------------------------
const settingsSchema = new mongoose.Schema(
  {
    version: { type: String, default: "1.0.0" },
    maintenance: { type: Boolean, default: false },
    environment: {
      type: String,
      enum: ["development", "staging", "production"],
      default: "production",
    },
    spinCooldown: { type: String, default: "24h" },
    premiumSpinCooldown: { type: String, default: "6h" },
    coinBurnRate: { type: Number, default: 0 },
    rewardMultiplier: { type: Number, default: 1 },
  },
  { timestamps: true }
);
const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

// -----------------------------
// Admin Audit Schema
// -----------------------------
const auditSchema = new mongoose.Schema(
  {
    adminEmail: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: Object, default: {} },
    ip: { type: String },
  },
  { timestamps: true }
);
const AdminAudit =
  mongoose.models.AdminAudit || mongoose.model("AdminAudit", auditSchema);

// -----------------------------
// Helper: Record Admin Action
// -----------------------------
async function logAdminAction(adminEmail, action, details = {}, req = null) {
  try {
    await AdminAudit.create({
      adminEmail,
      action,
      details,
      ip: req?.ip || "unknown",
    });
  } catch (err) {
    console.error("Audit log save error:", err.message);
  }
}

// -----------------------------
// GET Settings
// -----------------------------
router.get("/settings", requireAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, settings });
  } catch (err) {
    console.error("Settings GET error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// -----------------------------
// UPDATE Settings
// -----------------------------
router.put("/settings", requireAdmin, async (req, res) => {
  try {
    const update = req.body;
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(update);
    } else {
      Object.assign(settings, update);
      await settings.save();
    }

    // ✅ Record audit trail
    await logAdminAction(req.admin.email, "Updated system settings", update, req);

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (err) {
    console.error("Settings PUT error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// -----------------------------
// GET Audit Logs
// -----------------------------
router.get("/audit", requireAdmin, async (req, res) => {
  try {
    const logs = await AdminAudit.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (err) {
    console.error("Audit fetch error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ============================================================
// ✅ GET all active rewards (User view)
// ============================================================
router.get("/", async (req, res) => {
  try {
    const rewards = await Reward.find({ status: "active" })
      .select("title description priceCoins type stock imageUrl")
      .sort({ createdAt: -1 });
    res.json({ success: true, rewards });
  } catch (err) {
    console.error("Rewards fetch error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ============================================================
// ✅ POST Redeem a reward
// ============================================================
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

    if (reward.stock <= 0)
      return res.status(400).json({ error: "Out of stock" });

    if (user.coins < reward.priceCoins)
      return res.status(400).json({ error: "Not enough coins" });

    // Deduct coins
    user.coins -= reward.priceCoins;

    // Apply reward effect
    if (reward.type === "mysteryBox") user.boxesOwned += 1;
    if (reward.type === "spinTicket") user.spinsUsed = Math.max(0, user.spinsUsed - 1);

    await user.save();

    // Reduce reward stock
    reward.stock -= 1;
    await reward.save();

    // Log transaction
    await Tx.create({
      userId: user._id,
      orderId: `REDEEM-${Date.now()}`,
      coins: -reward.priceCoins,
      meta: { source: "redeem", reward: reward.title, type: reward.type },
    });

    res.json({
      success: true,
      message: "Reward redeemed successfully",
      remainingCoins: user.coins,
      boxesOwned: user.boxesOwned,
    });
  } catch (err) {
    console.error("Redeem error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
   🧩 Product → Card Mapping (WooCommerce Strain Integration)
===================================================== */

// 🔹 List all product-card mappings
router.get("/cards/mappings", requireAdmin, async (req, res) => {
  try {
    const maps = await ProductCardMap.find()
      .populate("cardId", "name rarity imageUrl")
      .sort({ createdAt: -1 });
    res.json({ success: true, maps });
  } catch (err) {
    console.error("List mappings error:", err);
    res.status(500).json({ success: false, error: "Failed to load mappings" });
  }
});

// 🔹 Create new mapping
router.post("/cards/mappings", requireAdmin, async (req, res) => {
  try {
    const { productId, cardId, title, active = true } = req.body || {};
    if (!productId || !cardId) {
      return res
        .status(400)
        .json({ success: false, error: "productId and cardId required" });
    }

    const map = await ProductCardMap.create({ productId, cardId, title, active });
    const out = await map.populate("cardId", "name rarity imageUrl");

    res.json({ success: true, map: out });
  } catch (err) {
    console.error("Create mapping error:", err);
    const msg =
      err.code === 11000
        ? "Mapping for this productId already exists"
        : "Failed to create mapping";
    res.status(500).json({ success: false, error: msg });
  }
});

// 🔹 Update mapping
router.put("/cards/mappings/:id", requireAdmin, async (req, res) => {
  try {
    const map = await ProductCardMap.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("cardId", "name rarity imageUrl");

    if (!map)
      return res.status(404).json({ success: false, error: "Mapping not found" });

    res.json({ success: true, map });
  } catch (err) {
    console.error("Update mapping error:", err);
    res.status(500).json({ success: false, error: "Failed to update mapping" });
  }
});

// 🔹 Delete mapping
router.delete("/cards/mappings/:id", requireAdmin, async (req, res) => {
  try {
    await ProductCardMap.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete mapping error:", err);
    res.status(500).json({ success: false, error: "Failed to delete mapping" });
  }
});


/* =====================================================
   📤 Admin Upload Card Image to Cloudinary
===================================================== */
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });

    const folder = process.env.CLOUDINARY_FOLDER || "cannabuben_cards";

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

module.exports = router;
