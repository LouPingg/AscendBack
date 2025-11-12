import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  imageUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

// === TTL index ===
// ⏰ Supprime automatiquement les events après leur fin (endAt)
// MongoDB surveille le champ `endAt` et supprime le document 1 minute après expiration
eventSchema.index({ endAt: 1 }, { expireAfterSeconds: 60 });

export default mongoose.model("Event", eventSchema);
