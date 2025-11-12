import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    coverUrl: { type: String, default: null },
    coverPublicId: { type: String, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Album", albumSchema);
