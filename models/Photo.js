import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
    required: true,
  },
  url: { type: String, required: true },
  publicId: { type: String }, // Cloudinary public_id
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Photo", photoSchema);
