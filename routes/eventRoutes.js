import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createEvent,
  getAllEvents,
  deleteEvent,
} from "../controllers/eventController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getAllEvents);
router.post("/", verifyToken, upload.single("image"), createEvent);
router.delete("/:id", verifyToken, deleteEvent);

export default router;
