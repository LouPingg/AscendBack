import jwt from "jsonwebtoken";
import User from "../models/User.js";

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = await User.findById(decoded.userId);
    next();
  });
}

export function isAdmin(req, res, next) {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Admin only" });
  next();
}

export function isOwnerOrAdmin(model) {
  // Higher-order middleware : vérifie la propriété d’un élément
  return async (req, res, next) => {
    const doc = await model.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    const isOwner = doc.createdBy?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    req.doc = doc;
    next();
  };
}
