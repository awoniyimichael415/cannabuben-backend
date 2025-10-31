const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    priceCoins: { type: Number, required: true }, // cost in Grovi coins
    type: {
      type: String,
      enum: ["coupon", "mysteryBox", "spinTicket", "item"],
      default: "item",
    },
    stock: { type: Number, default: 0 }, // -1 means unlimited
    imageUrl: { type: String },
    terms: { type: String },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Reward || mongoose.model("Reward", rewardSchema);
