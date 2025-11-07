const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional for admin-created base cards
    name: { type: String, required: true },
    rarity: {
      type: String,
      enum: ["Common", "Rare", "Epic", "Legendary"],
      default: "Common",
    },
    coinsEarned: { type: Number, default: 0 },

    // ✅ NEW: WooCommerce Product ID
    productId: { type: Number, unique: true, sparse: true },

    // 🔹 New fields for admin catalog management
    imageUrl: { type: String, default: "" },
    active: { type: Boolean, default: true }, // admin can disable a card from drop pool

    // 🔹 Optional metadata
    description: { type: String, default: "" },
    category: { type: String, default: "General" },

    // 🔹 Game tracking
    obtainedFrom: {
      type: String,
      enum: ["spin", "box", "admin", "reward"],
      default: "box",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Card || mongoose.model("Card", cardSchema);
