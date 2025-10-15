require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Import Models and Routes
const User = require("./models/User.js");
const authRoutes = require("./routes/authRoutes.js");
const gameRoutes = require("./routes/gameRoutes");
const Card = require("./models/Card.js"); // ensure this exists

// ----- Middleware -----
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);

// ----- MongoDB connection -----
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

// ----- Transaction Schema -----
const txSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderId: String,
    coins: Number,
    meta: Object,
  },
  { timestamps: true }
);

// ✅ Prevent overwrite for Tx model
const Tx = mongoose.models.Tx || mongoose.model("Tx", txSchema);

// ----- Helper: verify WooCommerce webhook signature -----
function verifySignature(req) {
  const secret = process.env.WC_WEBHOOK_SECRET || "";
  const verify = (process.env.WEBHOOK_VERIFY || "true") !== "false";
  if (!verify) return true; // disabled for local testing
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

// ----- Webhook endpoint -----
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
    let user = await User.findOne({ email: billingEmail });
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

// ----- Public API -----
app.get("/api/user", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "email is required" });
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.json({ email, coins: 0 });
  res.json({ email: user.email, coins: user.coins });
});

// =====================================================
// 🎡 REAL DAILY SPIN GAME — server-determined outcomes
// =====================================================
app.post("/api/spin", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Define prize wheel values (adjust probabilities later)
    const PRIZE_BUCKET = [5, 10, 10, 15, 20, 25, 50, 100];
    const idx = Math.floor(Math.random() * PRIZE_BUCKET.length);
    const prize = PRIZE_BUCKET[idx];

    // Update user coins safely
    user.coins += prize;
    await user.save();

    // Log spin
    await Tx.create({
      userId: user._id,
      orderId: `SPIN-${Date.now()}`,
      coins: prize,
      meta: { source: "daily-spin" },
    });

    console.log(`🎡 Spin -> ${email}: +${prize} coins (total ${user.coins})`);

    res.json({ success: true, prize, total: user.coins });
  } catch (err) {
    console.error("Spin error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----- Available Strain Cards -----
const STRAINS = [
  { id: 1, name: "California Haze", rarity: "Common", coins: 10 },
  { id: 2, name: "Purple Dream", rarity: "Rare", coins: 15 },
  { id: 3, name: "Gold Rush", rarity: "Epic", coins: 25 },
  { id: 4, name: "Mint Fusion", rarity: "Legendary", coins: 20 },
  { id: 5, name: "Crimson Blaze", rarity: "Mythic", coins: 30 },
];

app.post("/api/cards/collect", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ pick a random strain (now includes id)
    const random = STRAINS[Math.floor(Math.random() * STRAINS.length)];

    // ✅ save to DB (include id reference)
    const card = await Card.create({
      userId: user._id,
      name: random.name,
      rarity: random.rarity,
      coinsEarned: random.coins,
      cardId: random.id, // 👈 added for consistency
    });

    // ✅ add coins to user
    user.coins += random.coins;
    await user.save();

    // ✅ log to transactions
    await Tx.create({
      userId: user._id,
      orderId: `CARD-${Date.now()}`,
      coins: random.coins,
      meta: { card: random },
    });

    console.log(`🃏 ${email} collected ${random.name} (+${random.coins} coins)`);

    // ✅ return everything frontend needs
    res.json({
      success: true,
      card: {
        id: random.id,
        name: random.name,
        rarity: random.rarity,
        coins: random.coins,
        image: `/src/assets/card-front-${random.id}.png`, // 👈 helps frontend show instantly
      },
      totalCoins: user.coins,
    });
  } catch (err) {
    console.error("Card collection error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =====================================================
// 📦 GET /api/cards?email=... — persistent card fetch
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
      image: c.image ? `/assets/cards/${c.image}` : null,
      createdAt: c.createdAt,
    }));

    return res.json({ success: true, cards: out });
  } catch (err) {
    console.error("Fetch cards error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ----- Health check -----
app.get("/health", (req, res) => res.send("OK"));

// ----- Start Server -----
app.get('/', (req, res) => {
  res.send('✅ CannaBuben backend is running fine!');
});
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
