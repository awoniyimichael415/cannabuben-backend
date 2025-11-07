const mongoose = require("mongoose");

const userCardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
    source: { type: String, enum: ["order", "box", "spin"], default: "order" },
    meta: {
      orderId: String,
      productId: Number,
      note: String,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.UserCard || mongoose.model("UserCard", userCardSchema);
