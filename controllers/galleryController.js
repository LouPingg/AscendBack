import Album from "../models/Album.js";
import Photo from "../models/Photo.js";
import cloudinary from "../config/cloudinary.js";

/* === Albums === */
export async function createAlbum(req, res) {
  try {
    const { title } = req.body;
    let coverUrl = null;

    // Si une image est envoyée avec la création
    if (req.file) {
      const up = await cloudinary.uploader.upload(req.file.path, {
        folder: "ascend-gallery",
      });
      coverUrl = up.secure_url;
    }

    const album = await Album.create({
      title,
      coverUrl,
      createdBy: req.user._id,
    });

    res.status(201).json(album);
  } catch (err) {
    console.error("Create album error:", err);
    res.status(500).json({ message: "Failed to create album" });
  }
}

export async function getAllAlbums(req, res) {
  try {
    const albums = await Album.find().populate("createdBy", "nickname role");
    res.json(albums);
  } catch (err) {
    console.error("Get albums error:", err);
    res.status(500).json({ message: "Failed to fetch albums" });
  }
}

export async function deleteAlbum(req, res) {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: "Album not found" });

    const isOwner = album.createdBy?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const photos = await Photo.find({ albumId: album._id });
    for (const p of photos) {
      if (p.publicId) await cloudinary.uploader.destroy(p.publicId);
    }
    await Photo.deleteMany({ albumId: album._id });
    await album.deleteOne();
    res.json({ message: "Album deleted" });
  } catch (err) {
    console.error("Delete album error:", err);
    res.status(500).json({ message: "Failed to delete album" });
  }
}

/* === Photos === */
export async function uploadPhoto(req, res) {
  try {
    const { albumId } = req.body;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const album = await Album.findById(albumId);
    if (!album) return res.status(404).json({ message: "Album not found" });

    // owner or admin
    const isOwner = album.createdBy?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const up = await cloudinary.uploader.upload(req.file.path, {
      folder: "ascend-gallery",
    });

    const photo = await Photo.create({
      albumId,
      imageUrl: up.secure_url,
      publicId: up.public_id,
      createdBy: req.user._id,
    });

    // set cover if none
    if (!album.coverUrl) {
      album.coverUrl = up.secure_url;
      await album.save();
    }

    res.status(201).json(photo);
  } catch (err) {
    console.error("Upload photo error:", err);
    res.status(500).json({ message: "Failed to upload photo" });
  }
}

export async function getPhotosByAlbum(req, res) {
  try {
    const { albumId } = req.params;
    const photos = await Photo.find({ albumId });
    res.json(photos);
  } catch (err) {
    console.error("Get photos error:", err);
    res.status(500).json({ message: "Failed to fetch photos" });
  }
}

export async function deletePhoto(req, res) {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const isOwner = photo.createdBy?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    if (photo.publicId) await cloudinary.uploader.destroy(photo.publicId);
    await photo.deleteOne();

    // if it was cover, refresh album cover
    const album = await Album.findById(photo.albumId);
    if (album && album.coverUrl === photo.imageUrl) {
      const next = await Photo.findOne({ albumId: album._id }).sort({ _id: 1 });
      album.coverUrl = next ? next.imageUrl : null;
      await album.save();
    }

    res.json({ message: "Photo deleted" });
  } catch (err) {
    console.error("Delete photo error:", err);
    res.status(500).json({ message: "Failed to delete photo" });
  }
}
