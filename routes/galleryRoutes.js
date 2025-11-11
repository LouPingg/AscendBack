import express from "express";
import multer from "multer";
import {
  verifyToken,
  isAdmin,
  isOwnerOrAdmin,
} from "../middleware/authMiddleware.js";
import {
  createAlbum,
  getAllAlbums,
  deleteAlbum,
  addPhoto,
  deletePhoto,
} from "../controllers/galleryController.js";
import Album from "../models/Album.js";
import Photo from "../models/Photo.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Tous peuvent lire
router.get("/albums", getAllAlbums);
router.get("/photos", async (req, res) => {
  const photos = await Photo.find().populate("albumId", "title");
  res.json(photos);
});

// Création d’album ou ajout de photo = user ou admin
router.post("/albums", verifyToken, createAlbum);
router.post("/photos/:albumId", verifyToken, upload.single("image"), addPhoto);

// Suppression = propriétaire ou admin
router.delete("/albums/:id", verifyToken, isOwnerOrAdmin(Album), deleteAlbum);
router.delete("/photos/:id", verifyToken, isOwnerOrAdmin(Photo), deletePhoto);

export default router;
