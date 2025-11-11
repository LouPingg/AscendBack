import Event from "../models/Event.js";
import cloudinary from "../config/cloudinary.js";

// === Créer un événement ===
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
      createdBy: req.user._id, // 👈 on relie à l’utilisateur connecté
    });

    res.status(201).json(event);
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ message: "Failed to create event" });
  }
}

// === Récupérer tous les événements (public) ===
export async function getAllEvents(req, res) {
  try {
    const now = new Date();
    const events = await Event.find({ endAt: { $gte: now } }).sort({
      startAt: 1,
    });
    res.json(events);
  } catch {
    res.status(500).json({ message: "Failed to fetch events" });
  }
}
// === Supprimer un événement (admin ou propriétaire) ===
export async function deleteEvent(req, res) {
  try {
    const event = req.doc; // défini par le middleware isOwnerOrAdmin
    if (event.imageUrl) {
      const publicId = event.imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`ascend-events/${publicId}`);
    }
    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(500).json({ message: "Failed to delete event" });
  }
}
