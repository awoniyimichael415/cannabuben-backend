const express = require("express");
const router = express.Router();
const Card = require("../models/Card");
const { verifyAdmin } = require("../middleware/adminMiddleware");

// List all cards
router.get("/", verifyAdmin, async (req, res) => {
  const cards = await Card.find().limit(100);
  res.json({ success: true, cards });
});

// Create / Edit card
router.post("/", verifyAdmin, async (req, res) => {
  const { id, name, rarity, coinsEarned } = req.body;
  let card;
  if (id) card = await Card.findByIdAndUpdate(id, { name, rarity, coinsEarned }, { new: true });
  else card = await Card.create({ name, rarity, coinsEarned });
  res.json({ success: true, card });
});

module.exports = router;
