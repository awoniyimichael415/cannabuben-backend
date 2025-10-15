const express = require("express");
const router = express.Router();
const { dailySpin, collectCard } = require("../controllers/gameController");

router.post("/spin", dailySpin);
router.post("/collect-card", collectCard);

module.exports = router;
