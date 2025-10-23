const mongoose = require("mongoose");

const txSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["earn", "spend", "airdrop", "burn"], default: "earn" },
    amount: { type: Number, default: 0 },
    source: { type: String }, // "spin" | "mystery_box" | "redeem" | "burn" | "manual"
    meta: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Tx || mongoose.model("Tx", txSchema);
