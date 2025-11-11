import express from "express";
import multer from "multer";
import {
  createAlbum,
  getAllAlbums,
  deleteAlbum,
} from "../controllers/galleryController.js";
import {
  uploadPhoto,
  deletePhoto,
  getPhotosByAlbum,
} from "../controllers/photoController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

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
