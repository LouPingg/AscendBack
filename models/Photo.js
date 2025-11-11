import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: "Album" },
  imageUrl: String,
  publicId: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Photo", photoSchema);
