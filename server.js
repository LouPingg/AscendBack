import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";

dotenv.config();
const app = express();

// === Connexion MongoDB ===
connectDB();

// === Middleware JSON ===
app.use(express.json());

// === CORS avec Authorization autorisé ===
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || [
      "http://localhost:5173",
      "https://loupingg.github.io",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // 🔥 essentiel pour le token
  })
);

// === Test route ===
app.get("/", (_, res) => res.send("✅ Ascend backend running!"));

// === Routes API ===
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/gallery", galleryRoutes);

// === Lancement serveur ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
