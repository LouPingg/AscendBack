import express from "express";
import {
  authorizeUser,
  getWhitelist,
  removeFromWhitelist,
} from "../controllers/authController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/authorize", verifyToken, isAdmin, authorizeUser);
router.get("/whitelist", verifyToken, isAdmin, getWhitelist);
router.delete(
  "/whitelist/:nickname",
  verifyToken,
  isAdmin,
  removeFromWhitelist
);

export default router;
