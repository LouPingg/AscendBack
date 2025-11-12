import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Debug temporaire (tu peux le retirer après test)
  console.log("🔐 Incoming Auth header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.warn("⚠️ Token decoded but user not found in DB");
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user; // tout le user dispo dans req.user
    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    res.status(403).json({ message: "Invalid or expired token" });
  }
}

export function isAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
}
