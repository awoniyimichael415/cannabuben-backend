const mongoose = require("mongoose");

// ===== Rarity Pool Schema =====
const rarityPoolSchema = new mongoose.Schema(
  {
    rarity: {
      type: String,
      enum: ["Common", "Rare", "Epic", "Legendary"],
      required: true,
    },
    weight: { type: Number, required: true }, // probability, e.g. 0.60 = 60%
    cardIds: [{ type: Number }], // optional references to specific card IDs
  },
  { _id: false }
);

// ===== Box Config Schema =====
const boxConfigSchema = new mongoose.Schema(
  {
    name: { type: String, default: "default" },
    isPublished: { type: Boolean, default: true },
    packSize: { type: Number, default: 1 }, // how many cards per box
    pools: [rarityPoolSchema], // rarity drop tables
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.BoxConfig ||
  mongoose.model("BoxConfig", boxConfigSchema);
