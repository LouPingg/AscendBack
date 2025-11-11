import express from "express";
import multer from "multer";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import {
  createAlbum,
  getAllAlbums,
  deleteAlbum,
} from "../controllers/albumController.js";
import {
  uploadPhoto,
  getPhotosByAlbum,
  deletePhoto,
} from "../controllers/photoController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// === Albums ===
router.get("/albums", getAllAlbums);
router.post("/albums", verifyToken, upload.none(), createAlbum);
router.delete("/albums/:id", verifyToken, deleteAlbum);

// === Photos ===
router.get("/photos/:albumId", getPhotosByAlbum);
router.post("/photos", verifyToken, upload.single("image"), uploadPhoto);
router.delete("/photos/:id", verifyToken, deletePhoto);

export default router;
