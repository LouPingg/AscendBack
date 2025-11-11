import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  coverUrl: { type: String }, // ✅ nouvelle propriété : image de couverture
});

export default mongoose.model("Album", albumSchema);
