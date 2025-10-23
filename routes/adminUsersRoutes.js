const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ GET ALL USERS (for admin panel)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({})
      .select("email coins name avatar createdAt updatedAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error("Admin fetch users error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
