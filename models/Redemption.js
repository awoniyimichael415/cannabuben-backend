const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rewardId: { type: mongoose.Schema.Types.ObjectId, ref: "Reward" },
    costCoins: Number,
    status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
    meta: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Redemption || mongoose.model("Redemption", redemptionSchema);
