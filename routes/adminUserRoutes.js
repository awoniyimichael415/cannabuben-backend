const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyAdmin } = require("../middleware/adminMiddleware");
const AdminAudit = require("../models/AdminAudit");

// Get all users
router.get("/", verifyAdmin, async (req, res) => {
  const users = await User.find().select("email coins role createdAt");
  res.json({ success: true, users });
});

// Adjust coins
router.post("/adjust-coins", verifyAdmin, async (req, res) => {
  const { email, delta } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  user.coins += Number(delta);
  await user.save();
  await AdminAudit.create({ adminId: req.admin._id, action: "adjust_coins", entity: email, meta: { delta } });
  res.json({ success: true, coins: user.coins });
});

module.exports = router;
