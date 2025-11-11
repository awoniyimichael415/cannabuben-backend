const mongoose = require("mongoose");

const productCardMapSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true, unique: true }, // WooCommerce product ID
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },

    // 🔹 ADD THESE FIELDS
    imageUrl: { type: String },      // URL from Cloudinary
    rarity: { type: String },        // Card rarity
    coinsEarned: { type: Number },   // Card reward
    title: { type: String },         // shown in admin
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ProductCardMap ||
  mongoose.model("ProductCardMap", productCardMapSchema);
