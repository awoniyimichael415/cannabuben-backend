require("dotenv").config();
const mongoose = require("mongoose");
const SpinConfig = require("../models/SpinConfig");
const BoxConfig = require("../models/BoxConfig");

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await SpinConfig.deleteMany({});
    await BoxConfig.deleteMany({});

    await SpinConfig.create({
      name: "default",
      isPublished: true,
      weights: [
        { label: "+1 Coin", type: "coins", value: 1, weight: 45 },
        { label: "+5 Coins", type: "coins", value: 5, weight: 25 },
        { label: "+10 Coins", type: "coins", value: 10, weight: 15 },
        { label: "+25 Coins", type: "coins", value: 25, weight: 10 },
        { label: "Mystery Box", type: "mystery_box", value: 1, weight: 5 },
      ],
      freeCooldownHours: 24,
      premiumCooldownHours: 6,
      version: 1,
    });

    await BoxConfig.create({
      name: "default",
      isPublished: true,
      packSize: 1,
      pools: [
        { rarity: "Common", weight: 0.6, cardIds: [] },
        { rarity: "Rare", weight: 0.25, cardIds: [] },
        { rarity: "Epic", weight: 0.1, cardIds: [] },
        { rarity: "Legendary", weight: 0.05, cardIds: [] },
      ],
      version: 1,
    });

    console.log("✅ Seeded default Spin/Box configs");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
