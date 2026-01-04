import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getAllProperties,
  createProperty,
  deleteProperty,
  getPropertyTags,
} from "../controllers/propertyController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getAllProperties);
router.get("/tags", getPropertyTags);

router.post("/", verifyToken, upload.single("image"), createProperty);
router.delete("/:id", verifyToken, deleteProperty);

export default router;
