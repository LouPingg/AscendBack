import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startAt: { type: Date, required: true },
  endAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // ✅ TTL index : suppression automatique à la fin
  },
  imageUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Event", eventSchema);
