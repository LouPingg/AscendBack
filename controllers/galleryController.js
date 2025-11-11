import Album from "../models/Album.js";
import Photo from "../models/Photo.js";
import cloudinary from "../config/cloudinary.js";

// === Créer un album ===
export async function createAlbum(req, res) {
  try {
    const { title } = req.body;
    const album = await Album.create({
      title,
      createdBy: req.user._id, // 👈 l’auteur
    });
    res.status(201).json(album);
  } catch (err) {
    console.error("Create album error:", err);
    res.status(500).json({ message: "Failed to create album" });
  }
}

// === Lister tous les albums ===
export async function getAllAlbums(req, res) {
  try {
    const albums = await Album.find().populate("createdBy", "nickname role");
    res.json(albums);
  } catch (err) {
    console.error("Get albums error:", err);
    res.status(500).json({ message: "Failed to fetch albums" });
  }
}

// === Supprimer un album (admin ou propriétaire) ===
export async function deleteAlbum(req, res) {
  try {
    const album = req.doc; // défini par le middleware
    const photos = await Photo.find({ albumId: album._id });

    for (const p of photos) {
      await cloudinary.uploader.destroy(p.publicId);
    }

    await Photo.deleteMany({ albumId: album._id });
    await album.deleteOne();

    res.json({ message: "Album deleted successfully" });
  } catch (err) {
    console.error("Delete album error:", err);
    res.status(500).json({ message: "Failed to delete album" });
  }
}

// === Ajouter une photo à un album ===
export async function addPhoto(req, res) {
  try {
    const { albumId } = req.params;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "ascend-gallery",
    });

    const photo = await Photo.create({
      albumId,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      createdBy: req.user._id, // 👈 auteur de la photo
    });

    res.status(201).json(photo);
  } catch (err) {
    console.error("Add photo error:", err);
    res.status(500).json({ message: "Failed to upload photo" });
  }
}

// === Supprimer une photo (admin ou propriétaire) ===
export async function deletePhoto(req, res) {
  try {
    const photo = req.doc;
    await cloudinary.uploader.destroy(photo.publicId);
    await photo.deleteOne();
    res.json({ message: "Photo deleted successfully" });
  } catch (err) {
    console.error("Delete photo error:", err);
    res.status(500).json({ message: "Failed to delete photo" });
  }
}
