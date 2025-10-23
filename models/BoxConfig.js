const mongoose = require("mongoose");

const rarityPoolSchema = new mongoose.Schema(
  {
    rarity: { type: String, enum: ["Common", "Rare", "Epic", "Legendary"], required: true },
    weight: { type: Number, required: true }, // e.g. 0.60
    cardIds: [{ type: Number }],
  },
  { _id: false }
);

const boxConfigSchema = new mongoose.Schema(
  {
    name: { type: String, default: "default" },
    isPublished: { type: Boolean, default: true },
    packSize: { type: Number, default: 1 },
    pools: [rarityPoolSchema],
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.BoxConfig || mongoose.model("BoxConfig", boxConfigSchema);
