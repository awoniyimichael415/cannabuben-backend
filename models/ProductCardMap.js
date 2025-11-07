const mongoose = require("mongoose");

const productCardMapSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true, unique: true }, // Woo product_id
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
    title: { type: String }, // optional label for admin
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ProductCardMap ||
  mongoose.model("ProductCardMap", productCardMapSchema);
