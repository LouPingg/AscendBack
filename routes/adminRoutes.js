import express from "express";
import {
  addToWhitelist,
  getWhitelist,
  removeFromWhitelist,
  resetPassword,
  getAllUsers,
} from "../controllers/adminController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken, isAdmin);

// ✅ Récupérer la liste des pseudos whitelistés
router.get("/whitelist", getWhitelist);

// ✅ Ajouter un pseudo à la whitelist
router.post("/whitelist", addToWhitelist);

// ✅ Supprimer un pseudo de la whitelist
router.delete("/whitelist/:nickname", removeFromWhitelist);

// ✅ Réinitialiser un mot de passe
router.put("/reset-password", resetPassword);

// ✅ Obtenir la liste de tous les utilisateurs
router.get("/users", getAllUsers);

export default router;
