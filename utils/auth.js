const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getTokenFrom(req) {
  const h = req.headers.authorization || req.headers.Authorization || "";
  if (!h) return null;
  if (h.startsWith("Bearer ")) return h.slice(7);
  return h;
}

async function requireAuth(req, res, next) {
  try {
    const token = getTokenFrom(req);
    if (!token) return res.status(401).json({ error: "Missing token" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // minimal payload: { id, email, role }
    req.user = { id: payload.id, email: payload.email, role: payload.role || "user" };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function requireStaff(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (["admin", "staff"].includes(req.user.role)) return next();
  return res.status(403).json({ error: "Forbidden" });
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role === "admin") return next();
  return res.status(403).json({ error: "Forbidden" });
}

module.exports = { requireAuth, requireStaff, requireAdmin };
