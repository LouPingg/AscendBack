import cloudinary from "../config/cloudinary.js";
import Event from "../models/Event.js";

// Créer un événement
export async function createEvent(req, res) {
  try {
    const { title, description, startAt, endAt } = req.body;
    let imageUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "ascend-events",
      });
      imageUrl = result.secure_url;
    }

    const event = await Event.create({
      title,
      description,
      startAt,
      endAt,
      imageUrl,
    });
    res.status(201).json(event);
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ message: "Failed to create event" });
  }
}
