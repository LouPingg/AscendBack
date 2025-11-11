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
const upload = multer({ dest: "uploads/" });

// Albums
router.get("/albums", getAllAlbums);
router.post("/albums", verifyToken, upload.single("image"), createAlbum);
router.delete("/albums/:id", verifyToken, deleteAlbum);

// Photos
router.get("/photos/:albumId", getPhotos);
router.post("/photos/:albumId", verifyToken, upload.single("image"), addPhoto);
router.delete("/photos/:id", verifyToken, deletePhoto);

export default router;
