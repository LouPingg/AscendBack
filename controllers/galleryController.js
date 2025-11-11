import Album from "../models/Album.js";
import Photo from "../models/Photo.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/* ========= ALBUMS ========= */
export async function createAlbum(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { title } = req.body;
    const album = await Album.create({ title, createdBy: req.user.userId });
    res.status(201).json(album);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create album", error: err.message });
  }
}

export async function getAllAlbums(req, res) {
  try {
    const albums = await Album.find().populate("createdBy", "nickname role");
    res.json(albums);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch albums" });
  }
}

export async function deleteAlbum(req, res) {
  try {
    const { id } = req.params;
    const album = await Album.findById(id);
    if (!album) return res.status(404).json({ message: "Album not found" });
    if (
      album.createdBy.toString() !== req.user.userId &&
      req.user.role !== "admin"
    )
      return res.status(403).json({ message: "Not authorized" });

    const photos = await Photo.find({ albumId: id });
    for (const photo of photos) {
      if (photo.publicId) await cloudinary.uploader.destroy(photo.publicId);
    }
    await Photo.deleteMany({ albumId: id });
    await album.deleteOne();
    res.json({ message: "Album deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete album" });
  }
}

/* ========= PHOTOS ========= */
export async function uploadPhoto(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { albumId } = req.body;
    if (!req.file?.buffer)
      return res.status(400).json({ message: "No file uploaded" });

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "ascend-gallery" },
      async (error, result) => {
        if (error)
          return res.status(500).json({ message: "Cloudinary upload failed" });

        const photo = await Photo.create({
          albumId,
          url: result.secure_url,
          publicId: result.public_id,
          uploadedBy: req.user.userId,
        });

        const album = await Album.findById(albumId);
        if (album && !album.coverUrl) {
          album.coverUrl = result.secure_url;
          await album.save();
        }
        res.status(201).json(photo);
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Photo upload failed", error: err.message });
  }
}

export async function deletePhoto(req, res) {
  try {
    const { id } = req.params;
    const photo = await Photo.findById(id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    if (
      photo.uploadedBy.toString() !== req.user.userId &&
      req.user.role !== "admin"
    )
      return res.status(403).json({ message: "Not authorized" });

    if (photo.publicId) await cloudinary.uploader.destroy(photo.publicId);
    const album = await Album.findById(photo.albumId);
    await photo.deleteOne();

    if (album && album.coverUrl === photo.url) {
      const nextPhoto = await Photo.findOne({ albumId: album._id }).sort({
        _id: 1,
      });
      album.coverUrl = nextPhoto ? nextPhoto.url : null;
      await album.save();
    }
    res.json({ message: "Photo deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete photo" });
  }
}

export async function getPhotosByAlbum(req, res) {
  try {
    const { albumId } = req.params;
    const photos = await Photo.find({ albumId });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch photos" });
  }
}
