const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rarity: { type: String },
    coinsEarned: { type: Number, default: 0 },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Card || mongoose.model("Card", cardSchema);
