// === Import modules ===
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

// === Import routes ===
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";

// === Configuration ===
dotenv.config();
const app = express();

// === Connect to MongoDB ===
connectDB();

// === Middleware ===
app.use(express.json());

// === CORS configuration ===
const RAW_ORIGINS =
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,https://loupingg.github.io,https://loupingg.github.io/Ascend";

const ALLOWED_ORIGINS = RAW_ORIGINS.split(",").map((s) => s.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// === Test route ===
app.get("/", (_, res) => res.send("✅ Ascend backend running!"));

// === API routes ===
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/gallery", galleryRoutes);

// === Start server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
