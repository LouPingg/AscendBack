import cloudinary from "../config/cloudinary.js";
import Event from "../models/Event.js";

/* ========= Créer un événement ========= */
export async function createEvent(req, res) {
  try {
    const { title, description, startAt, endAt } = req.body;
    let imageUrl = null;

    // ✅ Upload image sur Cloudinary si présente
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

/* ========= Récupérer tous les événements ========= */
export async function getAllEvents(req, res) {
  try {
    const events = await Event.find().sort({ startAt: 1 });
    res.json(events);
  } catch (err) {
    console.error("Get events error:", err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
}

/* ========= Supprimer un événement ========= */
export async function deleteEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // ✅ Supprime l’image Cloudinary si elle existe
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
