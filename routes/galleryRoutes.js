import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createAlbum,
  getAllAlbums,
  deleteAlbum,
  addPhoto,
  getPhotos,
  deletePhoto,
} from "../controllers/galleryController.js";

const router = express.Router();

// Multer (stockage temporaire)
const upload = multer({ dest: "uploads/" });

// === ALBUMS ===
router.get("/albums", getAllAlbums);
router.post("/albums", verifyToken, upload.single("image"), createAlbum);
router.delete("/albums/:id", verifyToken, deleteAlbum);

// === PHOTOS ===
router.get("/albums/:albumId/photos", getPhotos); // ✅ Correction route
router.post(
  "/albums/:albumId/photos",
  verifyToken,
  upload.single("image"),
  addPhoto
);
router.delete("/photos/:id", verifyToken, deletePhoto);

export default router;
