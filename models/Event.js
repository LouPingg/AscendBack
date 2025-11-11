import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  startAt: Date,
  endAt: Date,
  imageUrl: String,
});

eventSchema.index({ endAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model("Event", eventSchema);
