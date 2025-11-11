import express from "express";
import {
  signup,
  login,
  resetPassword,
  getAllUsers,
} from "../controllers/authController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// === Public ===
router.post("/signup", signup);
router.post("/login", login);

// === Admin ===
router.post("/reset-password", verifyToken, isAdmin, resetPassword);
router.get("/users", verifyToken, isAdmin, getAllUsers);

export default router;
