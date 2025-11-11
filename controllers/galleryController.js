import { v2 as cloudinary } from "cloudinary";
import Album from "../models/Album.js";
import Photo from "../models/Photo.js";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// === Créer un album (avec ou sans photo de couverture) ===
export async function createAlbum(req, res) {
  try {
    const { title } = req.body;
    let coverUrl = null;

    // Si une image est envoyée à la création
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "ascend-gallery",
      });
      coverUrl = result.secure_url;
    }

    const album = await Album.create({
      title,
      coverUrl,
      createdBy: req.user.userId,
    });

    res.status(201).json(album);
  } catch (err) {
    console.error("Create album error:", err);
    res.status(500).json({ message: "Failed to create album" });
  }
}

// === Récupérer tous les albums ===
export async function getAllAlbums(req, res) {
  try {
    const albums = await Album.find().populate("createdBy", "nickname role");
    res.json(albums);
  } catch (err) {
    console.error("Fetch albums error:", err);
    res.status(500).json({ message: "Failed to fetch albums" });
  }
}

// === Supprimer un album ===
export async function deleteAlbum(req, res) {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: "Album not found" });

    // Supprime toutes les photos associées dans Cloudinary
    const photos = await Photo.find({ albumId: album._id });
    for (const p of photos) await cloudinary.uploader.destroy(p.publicId);

    await Photo.deleteMany({ albumId: album._id });
    await album.deleteOne();

    res.json({ message: "Album deleted" });
  } catch (err) {
    console.error("Delete album error:", err);
    res.status(500).json({ message: "Failed to delete album" });
  }
}

// === Ajouter une photo dans un album ===
export async function addPhoto(req, res) {
  try {
    const { albumId } = req.params;
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "ascend-gallery",
    });

    const photo = await Photo.create({
      albumId,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      createdBy: req.user.userId,
    });

    // 💡 Si c’est la première photo => devient la cover
    const album = await Album.findById(albumId);
    if (!album.coverUrl) {
      album.coverUrl = result.secure_url;
      await album.save();
    }

    res.status(201).json(photo);
  } catch (err) {
    console.error("Add photo error:", err);
    res.status(500).json({ message: "Failed to upload photo" });
  }
}

// === Récupérer les photos d’un album ===
export async function getPhotos(req, res) {
  try {
    const photos = await Photo.find({ albumId: req.params.albumId });
    res.json(photos);
  } catch (err) {
    console.error("Get photos error:", err);
    res.status(500).json({ message: "Failed to fetch photos" });
  }
}

// === Supprimer une photo ===
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
