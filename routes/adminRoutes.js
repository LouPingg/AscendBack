import express from "express";
import {
  authorizeUser,
  getWhitelist,
  removeFromWhitelist,
  resetPassword,
  getAllUsers,
  deleteUser,
} from "../controllers/authController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { deleteUser } from "../controllers/authController.js";
const router = express.Router();

// Autoriser / whitelist un user
router.post("/authorize", verifyToken, isAdmin, authorizeUser);

// Récupérer la whitelist
router.get("/whitelist", verifyToken, isAdmin, getWhitelist);

// Supprimer un pseudo de la whitelist
router.delete(
  "/whitelist/:nickname",
  verifyToken,
  isAdmin,
  removeFromWhitelist
);

// Réinitialiser un mot de passe
router.post("/reset-password", verifyToken, isAdmin, resetPassword);

// Voir tous les users
router.get("/users", verifyToken, isAdmin, getAllUsers);

// Supprimer un user
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);

export default router;
