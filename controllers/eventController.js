import Event from "../models/Event.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// === Config Cloudinary ===
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// === Créer un event avec upload image ===
export async function createEvent(req, res) {
  try {
    const { title, description, startAt, endAt } = req.body;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "ascend-events",
    });

    const event = await Event.create({
      title,
      description,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      imageUrl: result.secure_url,
      publicId: result.public_id,
      createdBy: req.user.userId,
    });

    res.status(201).json(event);
  } catch (err) {
    console.error("❌ Error creating event:", err);
    res.status(500).json({ message: "Failed to create event" });
  }
}

// === Récupérer tous les events ===
export async function getAllEvents(req, res) {
  try {
    const events = await Event.find()
      .populate("createdBy", "nickname role")
      .sort({ startAt: 1 }); // tri par date croissante
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
}

// === Récupérer les events des 7 prochains jours ===
export async function getNext7DaysEvents(req, res) {
  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const events = await Event.find({
      date: { $gte: now, $lte: nextWeek },
    }).sort({ date: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch next 7 days events" });
  }
}

// === Modifier un event ===
export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (
      req.user.role !== "admin" &&
      req.user.userId !== event.createdBy.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    event.title = req.body.title || event.title;
    event.description = req.body.description || event.description;
    event.date = req.body.date || event.date;

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to update event" });
  }
}

// === Supprimer un event ===
export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (
      req.user.role !== "admin" &&
      req.user.userId !== event.createdBy.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (event.publicId) await cloudinary.v2.uploader.destroy(event.publicId);
    await event.deleteOne();

    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete event" });
  }
}
