// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true, lowercase: true, trim: true, unique: true },
    wcCustomerId: { type: String },
    coins: { type: Number, default: 0 },
    password: { type: String, default: "" }, // hashed when set

    // Added fields correctly inside schema
    lastFreeSpinAt: { type: Date },
    lastPremiumSpinAt: { type: Date },
    spinsUsed: { type: Number, default: 0 },
    boxes: { type: Number, default: 0 },
    role: { type: String, enum: ["user", "staff", "admin"], default: "user" },
  },
  { timestamps: true }
);

// Avoid OverwriteModelError in dev hot-reload
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
