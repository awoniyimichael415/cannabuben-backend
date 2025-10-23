require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Import Models and Routes
const User = require("./models/User.js");
const Card = require("./models/Card.js");
const authRoutes = require("./routes/authRoutes.js");
const gameRoutes = require("./routes/gameRoutes.js");

// ✅ Phase 3 Routes
const spinRoutes = require("./routes/spinRoutes.js");
const boxRoutes = require("./routes/boxRoutes.js");
const rewardRoutes = require("./routes/rewardRoutes.js");

// ✅ SINGLE Admin Router (contains all admin endpoints)
const adminRoutes = require("./routes/adminRoutes.js");

// ✅ Middleware
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(cors());
app.use(express.json());

// ✅ Mount core routes
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);

// ✅ Mount feature routes
app.use("/api/spin", spinRoutes);
app.use("/api/box", boxRoutes);
app.use("/api/rewards", rewardRoutes);

// ✅ Mount Admin routes (one unified router)
app.use("/api/admin", adminRoutes);


// ✅ MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/cannabuben";

mongoose.set("strictQuery", true);
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ✅ Transaction Schema
const txSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderId: String,
    coins: Number,
    meta: Object,
  },
  { timestamps: true }
);
const Tx = mongoose.models.Tx || mongoose.model("Tx", txSchema);

// ✅ Verify WooCommerce Webhook Signature
function verifySignature(req) {
  const secret = process.env.WC_WEBHOOK_SECRET || "";
  const verify = (process.env.WEBHOOK_VERIFY || "true") !== "false";
  if (!verify) return true;
  const signature = req.headers["x-wc-webhook-signature"] || "";
  if (!signature) return false;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(req.rawBody)
    .digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

// ✅ WooCommerce Webhook
app.post("/webhook/woocommerce", async (req, res) => {
  if (!verifySignature(req)) {
    console.warn("⚠️ Invalid webhook signature");
    return res.status(401).send("Invalid signature");
  }

  const order = req.body;
  const status = order.status || order.order_status || "";
  if (status !== "completed") return res.status(200).send("Ignored");

  const total = parseFloat(order.total || 0) || 0;
  const billingEmail =
    (order.billing && order.billing.email) ||
    order.billing_email ||
    order.customer_email;
  const wcCustomerId = order.customer_id || String(order.customer_id || "");

  if (!billingEmail) {
    console.warn("Webhook missing email, skipping");
    return res.status(400).send("Missing email");
  }

  const coinsToAdd = Math.floor(total);
  try {
    let user = await User.findOne({ email: billingEmail.toLowerCase() });
    if (!user) user = new User({ email: billingEmail, wcCustomerId, coins: 0 });

    user.coins += coinsToAdd;
    user.wcCustomerId = user.wcCustomerId || wcCustomerId;
    await user.save();

    await Tx.create({
      userId: user._id,
      orderId: String(order.id || order.order_number || ""),
      coins: coinsToAdd,
      meta: { rawOrder: order },
    });

    console.log(`✅ +${coinsToAdd} coins -> ${billingEmail} (total ${user.coins})`);
    res.status(200).send("OK");
  } catch (err) {
    console.error("Processing error:", err);
    res.status(500).send("Server error");
  }
});

// ✅ Public User Coin Lookup
app.get("/api/user", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "email is required" });
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.json({ email, coins: 0 });
  res.json({ email: user.email, coins: user.coins, name: user.name || "", avatar: user.avatar || null });
});

// ✅ Update User Profile
app.post("/api/auth/update-profile", async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =====================================================
// 🎡 DAILY SPIN GAME
// =====================================================
app.post("/api/spin", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    const PRIZE_BUCKET = [5, 10, 15, 20, 25, 50, 100];
    const prize = PRIZE_BUCKET[Math.floor(Math.random() * PRIZE_BUCKET.length)];

    user.coins += prize;
    await user.save();

    await Tx.create({
      userId: user._id,
      orderId: `SPIN-${Date.now()}`,
      coins: prize,
      meta: { source: "daily-spin" },
    });

    console.log(`🎡 Spin -> ${email}: +${prize} coins`);
    res.json({ success: true, prize, total: user.coins });
  } catch (err) {
    console.error("Spin error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =====================================================
// 🃏 STRAIN CARDS — Random collectible cards
// =====================================================
const STRAINS = [
  { id: 1, name: "California Haze", rarity: "Common", coins: 10 },
  { id: 2, name: "Purple Dream", rarity: "Rare", coins: 15 },
  { id: 3, name: "Gold Rush", rarity: "Epic", coins: 25 },
  { id: 4, name: "Mint Fusion", rarity: "Legendary", coins: 20 },
  { id: 5, name: "Northern Lights", rarity: "Mythic", coins: 50 },
];

app.post("/api/cards/collect", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    const random = STRAINS[Math.floor(Math.random() * STRAINS.length)];

    await Card.create({
      userId: user._id,
      name: random.name,
      rarity: random.rarity,
      coinsEarned: random.coins,
      cardId: random.id,
    });

    user.coins += random.coins;
    await user.save();

    await Tx.create({
      userId: user._id,
      orderId: `CARD-${Date.now()}`,
      coins: random.coins,
      meta: { card: random },
    });

    res.json({
      success: true,
      card: random,
      totalCoins: user.coins,
    });
  } catch (err) {
    console.error("Card collection error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =====================================================
// 📦 Get All Collected Cards
// =====================================================
app.get("/api/cards", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    const cards = await Card.find({ userId: user._id }).sort({ createdAt: -1 });
    const out = cards.map((c) => ({
      id: c._id,
      name: c.name,
      rarity: c.rarity,
      coinsEarned: c.coinsEarned,
      createdAt: c.createdAt,
      cardId: c.cardId ?? null,
    }));

    return res.json({ success: true, cards: out });
  } catch (err) {
    console.error("Fetch cards error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// =====================================================
// 🩺 Health Check + Root Route
// =====================================================
app.get("/health", (req, res) => res.send("OK"));
app.get("/", (req, res) => res.send("✅ CannaBuben backend is running fine!"));

// =====================================================
// 🚀 Start Server
// =====================================================
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
