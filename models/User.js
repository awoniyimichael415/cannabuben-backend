// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    wcCustomerId: String,
    coins: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Prevent model overwrite errors
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
