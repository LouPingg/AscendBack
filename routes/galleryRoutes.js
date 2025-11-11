import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createAlbum,
  getAllAlbums,
  deleteAlbum,
  uploadPhoto,
  getPhotosByAlbum,
  deletePhoto,
} from "../controllers/galleryController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Albums
router.get("/albums", getAllAlbums);
router.post("/albums", verifyToken, createAlbum);
router.delete("/albums/:id", verifyToken, deleteAlbum);

// Photos
router.get("/photos/:albumId", getPhotosByAlbum);
router.post("/photos", verifyToken, upload.single("image"), uploadPhoto);
router.delete("/photos/:id", verifyToken, deletePhoto);

export default router;
