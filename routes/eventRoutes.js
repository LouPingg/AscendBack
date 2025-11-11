import express from "express";
import multer from "multer";
import { verifyToken, isOwnerOrAdmin } from "../middleware/authMiddleware.js";
import {
  createEvent,
  getAllEvents,
  deleteEvent,
} from "../controllers/eventController.js";
import Event from "../models/Event.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Lecture publique
router.get("/", getAllEvents);

// Création = user ou admin
router.post("/", verifyToken, upload.single("image"), createEvent);

// Suppression = propriétaire ou admin
router.delete("/:id", verifyToken, isOwnerOrAdmin(Event), deleteEvent);

export default router;
