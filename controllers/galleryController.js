import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import Album from "../models/Album.js";
import Photo from "../models/Photo.js";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// === Créer un album ===
export async function createAlbum(req, res) {
  try {
    const { title } = req.body;
    const createdBy = req.user?.userId;
    if (!createdBy)
      return res.status(401).json({ message: "Authentication required" });

    let coverUrl = null;
    let publicId = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "ascend-gallery",
      });
      coverUrl = result.secure_url;
      publicId = result.public_id;
      await fs.promises.unlink(req.file.path);
    }

    const album = await Album.create({
      title,
      coverUrl,
      coverPublicId: publicId,
      createdBy,
    });

    // ✅ ajoute aussi la cover comme photo
    if (req.file && coverUrl && publicId) {
      await Photo.create({
        albumId: album._id,
        imageUrl: coverUrl,
        publicId,
        createdBy,
      });
    }

    res.status(201).json(album);
  } catch (err) {
    console.error("❌ Create album error:", err);
    res.status(500).json({ message: "Failed to create album" });
  }
}

// === Récupérer tous les albums ===
export async function getAllAlbums(req, res) {
  try {
    const albums = await Album.find().populate("createdBy", "nickname role");
    res.json(albums);
  } catch (err) {
    console.error("❌ Fetch albums error:", err);
    res.status(500).json({ message: "Failed to fetch albums" });
  }
}

// === Supprimer un album ===
export async function deleteAlbum(req, res) {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: "Album not found" });

    const isOwner = album.createdBy?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (album.coverPublicId)
      await cloudinary.uploader.destroy(album.coverPublicId);

    const photos = await Photo.find({ albumId: album._id });
    for (const p of photos) await cloudinary.uploader.destroy(p.publicId);
    await Photo.deleteMany({ albumId: album._id });

    await album.deleteOne();
    res.json({ message: "Album deleted" });
  } catch (err) {
    console.error("❌ Delete album error:", err);
    res.status(500).json({ message: "Failed to delete album" });
  }
}

// === Ajouter une photo ===
export async function addPhoto(req, res) {
  try {
    const { albumId } = req.params;
    const createdBy = req.user?.userId;
    if (!createdBy)
      return res.status(401).json({ message: "Authentication required" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "ascend-gallery",
    });
    await fs.promises.unlink(req.file.path);

    const photo = await Photo.create({
      albumId,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      createdBy,
    });

    const album = await Album.findById(albumId);
    if (album && !album.coverUrl) {
      album.coverUrl = result.secure_url;
      album.coverPublicId = result.public_id;
      await album.save();
    }

    res.status(201).json(photo);
  } catch (err) {
    console.error("❌ Add photo error:", err);
    res.status(500).json({ message: "Failed to upload photo" });
  }
}

// === Supprimer une photo ===
export async function deletePhoto(req, res) {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const isOwner = photo.createdBy?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await cloudinary.uploader.destroy(photo.publicId);

    const album = await Album.findById(photo.albumId);
    if (album && album.coverPublicId === photo.publicId) {
      const nextPhoto = await Photo.findOne({
        albumId: album._id,
        _id: { $ne: photo._id },
      });
      if (nextPhoto) {
        album.coverUrl = nextPhoto.imageUrl;
        album.coverPublicId = nextPhoto.publicId;
      } else {
        album.coverUrl = null;
        album.coverPublicId = null;
      }
      await album.save();
    }

    await photo.deleteOne();
    res.json({ message: "Photo deleted" });
  } catch (err) {
    console.error("❌ Delete photo error:", err);
    res.status(500).json({ message: "Failed to delete photo" });
  }
}
