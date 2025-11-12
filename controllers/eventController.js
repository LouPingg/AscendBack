import Event from "../models/Event.js";
import cloudinary from "../config/cloudinary.js";

/* Create */
export async function createEvent(req, res) {
  try {
    const { title, description, startAt, endAt } = req.body;
    let imageUrl = null;

    if (req.file) {
      const up = await cloudinary.uploader.upload(req.file.path, {
        folder: "ascend-events",
      });
      imageUrl = up.secure_url;
    }

    const event = await Event.create({
      title,
      description,
      startAt,
      endAt,
      imageUrl,
      createdBy: req.user.userId,
    });

    res.status(201).json(event);
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ message: "Failed to create event" });
  }
}

/* Get all events (past + future) */
export async function getAllEvents(req, res) {
  try {
    const events = await Event.find()
      .populate("createdBy", "nickname role")
      .sort({ startAt: 1 });
    res.json(events);
  } catch (err) {
    console.error("Get events error:", err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
}

/* Delete (owner or admin) */
export async function deleteEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const isOwner =
      event.createdBy?.toString() === req.user.userId ||
      event.createdBy?.toString() === req.user._id?.toString();

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (event.imageUrl) {
      const publicId = event.imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`ascend-events/${publicId}`);
    }

    await event.deleteOne();
    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(500).json({ message: "Failed to delete event" });
  }
}
