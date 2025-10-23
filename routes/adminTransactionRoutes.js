const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Tx = mongoose.models.Tx || mongoose.model("Tx");
const { verifyAdmin } = require("../middleware/adminMiddleware");

router.get("/", verifyAdmin, async (_req, res) => {
  const tx = await Tx.find().sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, tx });
});

module.exports = router;
