import { v2 as cloudinary } from "cloudinary";
import Photo from "../models/Photo.js";
import Album from "../models/Album.js";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// === Upload photo ===
export async function uploadPhoto(req, res) {
  try {
    const { albumId } = req.body;
    if (!req.file) return res.status(400).json({ message: "No image file" });

    const album = await Album.findById(albumId);
    if (!album) return res.status(404).json({ message: "Album not found" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "ascend-gallery",
    });

    const photo = await Photo.create({
      albumId,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      createdBy: req.user.userId,
    });

    res.status(201).json(photo);
  } catch (err) {
    console.error("Upload photo error:", err);
    res.status(500).json({ message: "Failed to upload photo" });
  }
}

// === Get all photos in an album ===
export async function getPhotosByAlbum(req, res) {
  try {
    const { albumId } = req.params;
    const photos = await Photo.find({ albumId });
    res.json(photos);
  } catch {
    res.status(500).json({ message: "Failed to fetch photos" });
  }
}

// === Delete photo ===
export async function deletePhoto(req, res) {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    await cloudinary.uploader.destroy(photo.publicId);
    await photo.deleteOne();

    res.json({ message: "Photo deleted" });
  } catch (err) {
    console.error("Delete photo error:", err);
    res.status(500).json({ message: "Failed to delete photo" });
  }
}
