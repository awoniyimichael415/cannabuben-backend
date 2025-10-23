const mongoose = require("mongoose");

const spinConfigSchema = new mongoose.Schema(
  {
    name: { type: String, default: "default" },
    isPublished: { type: Boolean, default: true },
    weights: [
      {
        label: String, // "+1 Coin", "Mystery Box"
        type: { type: String, enum: ["coins", "mystery_box", "extra_spin", "nothing"], default: "coins" },
        value: { type: Number, default: 1 },
        weight: { type: Number, default: 1 },
      },
    ],
    premiumCooldownHours: { type: Number, default: 6 },
    freeCooldownHours: { type: Number, default: 24 },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SpinConfig || mongoose.model("SpinConfig", spinConfigSchema);
