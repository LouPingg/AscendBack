import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  imageUrl: String,
  publicId: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Event", eventSchema);
