import express from "express";
import {
  signup,
  login,
  authorizeUser,
  resetPassword,
  getAllUsers,
  deleteUser,
} from "../controllers/authController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth
router.post("/signup", signup);
router.post("/login", login);

// Admin
router.post("/whitelist", verifyToken, isAdmin, authorizeUser);
router.post("/reset-password", verifyToken, isAdmin, resetPassword);
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.delete("/user/:id", verifyToken, isAdmin, deleteUser);

export default router;
