import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  authorized: { type: Boolean, default: false }, // whitelist
});

export default mongoose.model("User", userSchema);
