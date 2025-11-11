import express from "express";
import {
  createEvent,
  getAllEvents,
  getNext7DaysEvents,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔓 Public routes
router.get("/", getAllEvents);
router.get("/next7", getNext7DaysEvents);

// 🔐 Protected routes
router.post("/", verifyToken, createEvent);
router.put("/:id", verifyToken, updateEvent);
router.delete("/:id", verifyToken, deleteEvent);

export default router;
