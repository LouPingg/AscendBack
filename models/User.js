import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nickname: { type: String, unique: true, required: true },
  password: { type: String, default: "temp" },
  authorized: { type: Boolean, default: false },
  role: { type: String, default: "user" },
});

export default mongoose.model("User", userSchema);
