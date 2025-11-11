import cloudinary from "../config/cloudinary.js";
import Album from "../models/Album.js";
import Photo from "../models/Photo.js";

export async function createAlbum(req, res) {
  try {
    const { title } = req.body;
    const album = await Album.create({ title, createdBy: req.user.userId });
    res.status(201).json(album);
  } catch {
    res.status(500).json({ message: "Failed to create album" });
  }
}

export async function getAllAlbums(req, res) {
  try {
    const albums = await Album.find().populate("createdBy", "nickname role");
    res.json(albums);
  } catch {
    res.status(500).json({ message: "Failed to fetch albums" });
  }
}

export async function deleteAlbum(req, res) {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: "Not found" });

    const photos = await Photo.find({ albumId: album._id });
    for (const p of photos) await cloudinary.uploader.destroy(p.publicId);

    await Photo.deleteMany({ albumId: album._id });
    await album.deleteOne();
    res.json({ message: "Album deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete album" });
  }
}
