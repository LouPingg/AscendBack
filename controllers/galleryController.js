import Album from "../models/Album.js";
import Photo from "../models/Photo.js";
import cloudinary from "../config/cloudinary.js"; // ✅ utilise ton fichier centralisé
import dotenv from "dotenv";
dotenv.config();

/* ========= ALBUMS ========= */

// ➕ Créer un album
export async function createAlbum(req, res) {
  try {
    const { title } = req.body;

    // 🛡️ Vérifie la présence de l'utilisateur
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: no user context." });
    }

    const album = await Album.create({
      title,
      createdBy: req.user.userId,
    });

    return res.status(201).json(album);
  } catch (err) {
    console.error("Create album error:", err);
    return res
      .status(500)
      .json({ message: "Failed to create album", error: err.message });
  }
}

// 📜 Obtenir tous les albums
export async function getAllAlbums(req, res) {
  try {
    const albums = await Album.find().populate("createdBy", "nickname role");
    return res.json(albums);
  } catch (err) {
    console.error("Get albums error:", err);
    return res.status(500).json({ message: "Failed to fetch albums" });
  }
}

// 🗑️ Supprimer un album
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

    // 🔄 Supprimer les photos associées dans Cloudinary et MongoDB
    const photos = await Photo.find({ albumId: id });
    for (const photo of photos) {
      if (photo.publicId) await cloudinary.uploader.destroy(photo.publicId);
    }

    await Photo.deleteMany({ albumId: id });
    await album.deleteOne();

    return res.json({ message: "Album deleted" });
  } catch (err) {
    console.error("Delete album error:", err);
    return res.status(500).json({ message: "Failed to delete album" });
  }
}

/* ========= PHOTOS ========= */

// 📤 Ajouter une photo
export async function uploadPhoto(req, res) {
  try {
    const { albumId } = req.body;
    const file = req.file;

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: no user context." });
    }
    if (!file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // ✅ Upload via buffer (plus fiable sur Render)
    const result = await cloudinary.uploader.upload_stream(
      { folder: "ascend-gallery" },
      async (error, uploadResult) => {
        if (error) {
          console.error("Cloudinary error:", error);
          return res.status(500).json({ message: "Cloudinary upload failed" });
        }

        const photo = await Photo.create({
          albumId,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          uploadedBy: req.user.userId,
        });

        // ✅ Si c’est la première photo, on la met en cover
        const album = await Album.findById(albumId);
        if (album && !album.coverUrl) {
          album.coverUrl = uploadResult.secure_url;
          await album.save();
        }

        return res.status(201).json(photo);
      }
    );

    // Stream buffer vers Cloudinary
    file.stream.pipe(result);
  } catch (err) {
    console.error("Upload photo error:", err);
    return res
      .status(500)
      .json({ message: "Photo upload failed", error: err.message });
  }
}

// 🗑️ Supprimer une photo
export async function deletePhoto(req, res) {
  try {
    const { id } = req.params;
    const photo = await Photo.findById(id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    if (
      photo.uploadedBy.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (photo.publicId) await cloudinary.uploader.destroy(photo.publicId);

    const album = await Album.findById(photo.albumId);
    await photo.deleteOne();

    // 🔄 Update cover si nécessaire
    if (album && album.coverUrl === photo.url) {
      const nextPhoto = await Photo.findOne({ albumId: album._id }).sort({
        _id: 1,
      });
      album.coverUrl = nextPhoto ? nextPhoto.url : null;
      await album.save();
    }

    return res.json({ message: "Photo deleted" });
  } catch (err) {
    console.error("Delete photo error:", err);
    return res.status(500).json({ message: "Failed to delete photo" });
  }
}

// 📷 Récupérer toutes les photos d’un album
export async function getPhotosByAlbum(req, res) {
  try {
    const { albumId } = req.params;
    const photos = await Photo.find({ albumId });
    return res.json(photos);
  } catch (err) {
    console.error("Get photos error:", err);
    return res.status(500).json({ message: "Failed to fetch photos" });
  }
}
