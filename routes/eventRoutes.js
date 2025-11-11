import express from "express";
import multer from "multer";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import {
  createEvent,
  getAllEvents,
  deleteEvent,
} from "../controllers/eventController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Public
router.get("/", getAllEvents);

// Admin only
router.post("/", verifyToken, isAdmin, upload.single("image"), createEvent);
router.delete("/:id", verifyToken, isAdmin, deleteEvent);

export default router;
