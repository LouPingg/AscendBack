import express from "express";
import {
  createAlbum,
  getAllAlbums,
  deleteAlbum,
  uploadPhoto,
  deletePhoto,
  getPhotosByAlbum,
} from "../controllers/galleryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js"; // 🟢 ajout ici

const router = express.Router();

/* ========= ALBUMS ========= */
router.post("/albums", verifyToken, createAlbum);
router.get("/albums", getAllAlbums);
router.delete("/albums/:id", verifyToken, deleteAlbum);

/* ========= PHOTOS ========= */
router.post("/photos", verifyToken, upload.single("image"), uploadPhoto); // 🟢 ajoute Multer ici
router.get("/photos/:albumId", getPhotosByAlbum);
router.delete("/photos/:id", verifyToken, deletePhoto);

export default router;
