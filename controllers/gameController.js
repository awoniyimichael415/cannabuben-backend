const User = require("../models/User");

// 🎯 Daily Spin - random coin reward
exports.dailySpin = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const reward = Math.floor(Math.random() * 100) + 10; // 10–110 coins
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email, coins: reward });
    } else {
      user.coins += reward;
      await user.save();
    }

    res.json({ success: true, reward, coins: user.coins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error processing spin" });
  }
};

// 🃏 Collect random strain card
exports.collectCard = async (req, res) => {
  const { email } = req.body;
  const strains = ["Blue Dream", "OG Kush", "Sour Diesel", "Purple Haze", "Girl Scout Cookies"];
  const randomCard = strains[Math.floor(Math.random() * strains.length)];

  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email, coins: 0, cards: [randomCard] });
    } else {
      if (!user.cards.includes(randomCard)) {
        user.cards.push(randomCard);
        await user.save();
      }
    }

    res.json({ success: true, card: randomCard, cards: user.cards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error collecting card" });
  }
};
