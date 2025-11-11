import express from "express";
import multer from "multer";
import {
  createEvent,
  getAllEvents,
  getNext7DaysEvents,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getAllEvents);
router.get("/next7", getNext7DaysEvents);
router.post("/", verifyToken, upload.single("image"), createEvent);
router.put("/:id", verifyToken, updateEvent);
router.delete("/:id", verifyToken, deleteEvent);

export default router;
