import Album from "../models/Album.js";
import Photo from "../models/Photo.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// === Cloudinary config ===
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

/* ========= ALBUMS ========= */

// Créer un album
export async function createAlbum(req, res) {
  try {
    const { title } = req.body;
    const album = await Album.create({ title, createdBy: req.user.userId });
    res.status(201).json(album);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create album", error: err.message });
  }
}

// Obtenir tous les albums
export async function getAllAlbums(req, res) {
  try {
    const albums = await Album.find().populate("createdBy", "nickname role");
    res.json(albums);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch albums" });
  }
}

// Supprimer un album
export async function deleteAlbum(req, res) {
  try {
    const { id } = req.params;
    const album = await Album.findById(id);
    if (!album) return res.status(404).json({ message: "Album not found" });

    if (
      album.createdBy.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Supprimer toutes les photos associées dans Cloudinary et MongoDB
    const photos = await Photo.find({ albumId: id });
    for (const photo of photos) {
      if (photo.publicId) await cloudinary.v2.uploader.destroy(photo.publicId);
    }

    await Photo.deleteMany({ albumId: id });
    await album.deleteOne();

    res.json({ message: "Album deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete album" });
  }
}

/* ========= PHOTOS ========= */

// Ajouter une photo
export async function uploadPhoto(req, res) {
  try {
    const { albumId } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: "ascend-gallery",
    });

    const photo = await Photo.create({
      albumId,
      url: result.secure_url,
      publicId: result.public_id,
      uploadedBy: req.user.userId,
    });

    // ✅ Si c’est la première photo → on la met comme cover
    const album = await Album.findById(albumId);
    if (album && !album.coverUrl) {
      album.coverUrl = result.secure_url;
      await album.save();
    }

    res.status(201).json(photo);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Photo upload failed", error: err.message });
  }
}

// Supprimer une photo
export async function deletePhoto(req, res) {
  try {
    const { id } = req.params;
    const photo = await Photo.findById(id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    // Vérifie autorisation
    if (
      photo.uploadedBy.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Supprime du Cloudinary
    if (photo.publicId) await cloudinary.v2.uploader.destroy(photo.publicId);

    // Récupère l’album avant suppression
    const album = await Album.findById(photo.albumId);

    // Supprime la photo de MongoDB
    await photo.deleteOne();

    // ✅ Mise à jour automatique de la cover
    if (album) {
      // Si la cover supprimée correspond à celle de l’album
      if (album.coverUrl === photo.url) {
        // Cherche la nouvelle première photo
        const nextPhoto = await Photo.findOne({ albumId: album._id }).sort({
          _id: 1,
        });
        album.coverUrl = nextPhoto ? nextPhoto.url : null; // prochaine photo ou rien
        await album.save();
      }
    }

    res.json({ message: "Photo deleted" });
  } catch (err) {
    console.error("Delete photo error:", err);
    res.status(500).json({ message: "Failed to delete photo" });
  }
}

// Récupérer toutes les photos d’un album
export async function getPhotosByAlbum(req, res) {
  try {
    const { albumId } = req.params;
    const photos = await Photo.find({ albumId });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch photos" });
  }
}
