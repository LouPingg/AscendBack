import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getAllProperties,
  createProperty,
  deleteProperty,
  getPropertyTags,
  updateProperty,
} from "../controllers/propertyController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getAllProperties);
router.get("/tags", getPropertyTags);

router.post("/", verifyToken, upload.single("image"), createProperty);
router.patch("/:id", verifyToken, upload.single("image"), updateProperty);
router.delete("/:id", verifyToken, deleteProperty);

export default router;
