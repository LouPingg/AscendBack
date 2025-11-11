import express from "express";
import { signup, login, authorizeUser } from "../controllers/authController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// === PUBLIC ===
router.post("/signup", signup);
router.post("/login", login);

// === ADMIN ===
router.post("/authorize", verifyToken, isAdmin, authorizeUser);

export default router;
