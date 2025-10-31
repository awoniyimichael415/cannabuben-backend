// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ===== BASIC INFO =====
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    wcCustomerId: { type: String, default: "" },
    coins: { type: Number, default: 0 },
    password: { type: String, default: "" }, // hashed when set

    // ===== GAME + ECONOMY FIELDS =====
    lastFreeSpinAt: { type: Date, default: null },      // free spin cooldown tracker
    lastPremiumSpinAt: { type: Date, default: null },   // premium spin cooldown tracker
    spinsUsed: { type: Number, default: 0 },            // total spins made

    // ✅ Unified field for unopened boxes (was boxesOwned before)
    boxes: { type: Number, default: 0 },                // number of unopened Mystery Boxes
    boxesOpened: { type: Number, default: 0 },          // total boxes opened

    // ✅ New field for spin ticket rewards
    spinTickets: { type: Number, default: 0 },          // premium spin passes earned from rewards

    // ===== USER STATUS =====
    role: {
      type: String,
      enum: ["user", "staff", "admin"],
      default: "user",
    },

    banned: { type: Boolean, default: false },          // admin can disable user
  },
  { timestamps: true }
);

// Avoid OverwriteModelError in dev hot-reload
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
