import express from "express";
import multer from "multer";
import {
  createAlbum,
  getAllAlbums,
  deleteAlbum,
  uploadPhoto,
  deletePhoto,
  getPhotosByAlbum,
} from "../controllers/galleryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/albums", getAllAlbums);
router.get("/albums/:albumId/photos", getPhotosByAlbum);

router.post("/albums", verifyToken, createAlbum);
router.delete("/albums/:id", verifyToken, deleteAlbum);
router.post("/photos", verifyToken, upload.single("file"), uploadPhoto);
router.delete("/photos/:id", verifyToken, deletePhoto);

export default router;
