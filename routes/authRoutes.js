import express from "express";
import {
  signup,
  login,
  authorizeUser,
  getWhitelist,
  removeFromWhitelist,
  resetPassword,
  getAllUsers,
  deleteUser,
} from "../controllers/authController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/signup", signup);
router.post("/login", login);

// Admin
router.post("/authorize", verifyToken, isAdmin, authorizeUser);
router.get("/whitelist", verifyToken, isAdmin, getWhitelist);
router.delete(
  "/whitelist/:nickname",
  verifyToken,
  isAdmin,
  removeFromWhitelist
);
router.post("/reset-password", verifyToken, isAdmin, resetPassword);
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);

export default router;
