const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "admin")
      return res.status(403).json({ error: "Forbidden – not an admin" });

    req.admin = user;
    next();
  } catch (err) {
    console.error("Admin verify error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
