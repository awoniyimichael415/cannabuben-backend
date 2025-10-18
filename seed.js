require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User.js");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cannabuben";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const email = "testuser@example.com";
    const password = "Cann@12345!";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("⚠️ Test user already exists. Updating password...");
      existing.password = await bcrypt.hash(password, 10);
      await existing.save();
      console.log("✅ Password reset for testuser@example.com");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        email,
        password: hashedPassword,
        coins: 100, // Give some test coins
      });
      console.log("✅ Test user created:", email);
    }

    console.log(`
🚀 Test user ready:
Email: ${email}
Password: ${password}
Coins: 100
`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeder error:", err);
    process.exit(1);
  }
}

seed();
