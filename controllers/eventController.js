import Event from "../models/Event.js";

/* ========= CREATE EVENT ========= */
export async function createEvent(req, res) {
  try {
    const { title, description, imageUrl, startAt, endAt } = req.body;

    if (!title || !startAt || !endAt)
      return res.status(400).json({ message: "Missing required fields" });

    const event = await Event.create({
      title,
      description,
      imageUrl,
      startAt,
      endAt,
      createdBy: req.user.userId,
    });

    res.status(201).json(event);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Failed to create event" });
  }
}

/* ========= GET ALL EVENTS ========= */
export async function getAllEvents(req, res) {
  try {
    const events = await Event.find()
      .populate("createdBy", "nickname role")
      .sort({ startAt: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
}

/* ========= GET NEXT 7 DAYS EVENTS ========= */
export async function getNext7DaysEvents(req, res) {
  try {
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7);

    const events = await Event.find({
      startAt: { $gte: now, $lte: in7Days },
    }).sort({ startAt: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch upcoming events" });
  }
}

/* ========= UPDATE EVENT ========= */
export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (
      event.createdBy.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Event.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update event" });
  }
}

/* ========= DELETE EVENT ========= */
export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (
      event.createdBy.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete event" });
  }
}
