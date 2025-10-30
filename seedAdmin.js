import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    const hashed = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      nickname: "admin",
      password: hashed,
      role: "admin",
      authorized: true,
    });

    console.log("🎉 Admin created:", admin);
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Seed error:", err);
  }
}

seedAdmin();