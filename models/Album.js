import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
  title: String,
  coverUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Album", albumSchema);
