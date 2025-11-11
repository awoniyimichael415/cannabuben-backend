require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Import Models
const User = require("./models/User.js");
const Card = require("./models/Card.js");
const SpinConfig = require("./models/SpinConfig.js");
const BoxConfig = require("./models/BoxConfig.js");
const Reward = require("./models/Reward.js");

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes.js");
const gameRoutes = require("./routes/gameRoutes.js");
const spinRoutes = require("./routes/spinRoutes.js");
const boxRoutes = require("./routes/boxRoutes.js");
const rewardRoutes = require("./routes/rewardRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const ProductCardMap = require("./models/ProductCardMap.js");
const UserCard = require("./models/UserCard.js");


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

// ✅ Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/spin", spinRoutes);
app.use("/api/box", boxRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/admin", adminRoutes);

// ✅ MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cannabuben";

mongoose.set("strictQuery", true);
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

/* =====================================================
   🛍️ WooCommerce Webhook — Order Completed
   Automatically rewards coins and creates users
===================================================== */
const Tx = require("./models/Tx.js"); // ✅ create this if missing

function verifyWooSignature(req) {
  const secret = process.env.WC_WEBHOOK_SECRET || "";
  const signature = req.headers["x-wc-webhook-signature"];
  if (!secret || !signature) return false;

  const hash = crypto.createHmac("sha256", secret).update(req.rawBody).digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

/* =====================================================
   🛍️ WooCommerce Webhook — Order Completed
   Automatically rewards coins & strain cards
===================================================== */
app.post("/webhook/woocommerce", async (req, res) => {
  try {
    if (!verifyWooSignature(req)) {
      console.warn("⚠️ Invalid WooCommerce signature");
      return res.status(401).send("Invalid signature");
    }

    const order = req.body;
    const status = order.status || order.order_status || "";
    if (status !== "completed") {
      console.log("🕓 Ignored non-completed order");
      return res.status(200).send("Ignored");
    }

    const total = parseFloat(order.total || order.total_price || 0);
    const coinsToAdd = Math.floor(total);
    const billingEmail =
      order.billing?.email ||
      order.customer_email ||
      order.billing_email ||
      null;
    const wcCustomerId = order.customer_id || String(order.customer_id || "");
    const orderId = String(order.id || order.order_number || "UNKNOWN");

    if (!billingEmail) {
      console.warn("❌ Missing billing email — skipping");
      return res.status(400).send("Missing email");
    }

    // ✅ Create or update user
    let user = await User.findOne({ email: billingEmail.toLowerCase() });
    if (!user) {
      user = new User({ email: billingEmail.toLowerCase(), wcCustomerId, coins: 0 });
    }

    user.coins += coinsToAdd;
    user.wcCustomerId = user.wcCustomerId || wcCustomerId;
    await user.save();

    // ✅ Record transaction (coins)
    await Tx.create({
      userId: user._id,
      orderId,
      coins: coinsToAdd,
      meta: { source: "woocommerce", total, rawOrder: order },
    });

    console.log(`✅ ${billingEmail} credited +${coinsToAdd} coins (Order ${orderId})`);

    /* =====================================================
       🎴 Reward Strain Cards for Each Product
    ====================================================== */
    if (Array.isArray(order.line_items)) {
      for (const item of order.line_items) {
        const productId = Number(item.product_id);
        if (!productId) continue;

        // find mapped strain card
        const mapping = await ProductCardMap.findOne({ productId, active: true })
          .populate("cardId", "name rarity imageUrl");

        if (mapping && mapping.cardId) {
          // create a userCard record
          await UserCard.create({
            userId: user._id,
            cardId: mapping.cardId._id,
            source: "order",
            meta: { orderId, productId, note: `Bought ${item.name}` },
          });

          console.log(`🎴 Added strain card "${mapping.cardId.name}" to ${billingEmail}`);
        }
      }
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).send("Server error");
  }
});


/* =====================================================
   👤 USER PROFILE LOOKUP (for dashboard, games)
===================================================== */
app.get("/api/user", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "email is required" });

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    return res.json({ email, coins: 0, boxes: 0, spinTickets: 0, spinsUsed: 0 });
  }

  // ✅ Add banned flag
  res.json({
    email: user.email,
    coins: user.coins,
    name: user.name || "",
    avatar: user.avatar || null,
    boxes: user.boxes || 0,
    spinTickets: user.spinTickets || 0,
    spinsUsed: user.spinsUsed || 0,
    banned: user.banned || false,
  });
});

/* =====================================================
   ✏️ Update Profile
===================================================== */
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
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
   🩺 Health Check
===================================================== */
app.get("/health", (req, res) => res.send("OK"));
app.get("/", (req, res) => res.send("✅ CannaBuben backend is running fine!"));

/* =====================================================
   🚀 Start Server
===================================================== */
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
