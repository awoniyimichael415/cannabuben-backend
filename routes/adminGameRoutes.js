const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/adminMiddleware");
const SpinConfig = require("../models/SpinConfig");

// Fetch & update spin config
router.get("/spin-config", verifyAdmin, async (req, res) => {
  const cfg = await SpinConfig.findOne() || {};
  res.json({ success: true, config: cfg });
});

router.post("/spin-config", verifyAdmin, async (req, res) => {
  const data = req.body;
  const cfg = await SpinConfig.findOneAndUpdate({}, data, { upsert: true, new: true });
  res.json({ success: true, config: cfg });
});

module.exports = router;
