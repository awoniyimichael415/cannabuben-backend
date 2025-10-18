// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true, lowercase: true, trim: true, unique: true },
    wcCustomerId: { type: String },
    coins: { type: Number, default: 0 },
    password: { type: String, default: "" }, // hashed when set
  },
  { timestamps: true }
);

// Avoid OverwriteModelError in dev hot-reload
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
