import { v2 as cloudinary } from "cloudinary";
import Photo from "../models/Photo.js";
import Album from "../models/Album.js";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export async function uploadPhoto(req, res) {
  try {
    const { albumId } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "ascend-gallery",
    });

    const photo = await Photo.create({
      albumId,
      url: result.secure_url,
      publicId: result.public_id,
      uploadedBy: req.user.userId,
    });

    // Si première photo = cover
    const album = await Album.findById(albumId);
    if (album && !album.coverUrl) {
      album.coverUrl = result.secure_url;
      await album.save();
    }

    res.status(201).json(photo);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Photo upload failed" });
  }
}

export async function deletePhoto(req, res) {
  try {
    const { id } = req.params;
    const photo = await Photo.findById(id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    await cloudinary.uploader.destroy(photo.publicId);
    await photo.deleteOne();

    const album = await Album.findById(photo.albumId);
    if (album && album.coverUrl === photo.url) {
      const nextPhoto = await Photo.findOne({ albumId: album._id }).sort({
        _id: 1,
      });
      album.coverUrl = nextPhoto ? nextPhoto.url : null;
      await album.save();
    }

    res.json({ message: "Photo deleted" });
  } catch (err) {
    console.error("Delete photo error:", err);
    res.status(500).json({ message: "Failed to delete photo" });
  }
}

export async function getPhotosByAlbum(req, res) {
  try {
    const photos = await Photo.find({ albumId: req.params.albumId });
    res.json(photos);
  } catch {
    res.status(500).json({ message: "Failed to fetch photos" });
  }
}
