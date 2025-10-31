// models/Redemption.js
const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rewardId: { type: mongoose.Schema.Types.ObjectId, ref: "Reward", required: true },
  coinsSpent: { type: Number, required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
}, { timestamps: true });

module.exports = mongoose.models.Redemption || mongoose.model("Redemption", redemptionSchema);
