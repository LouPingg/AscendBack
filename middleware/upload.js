import multer from "multer";
import path from "path";
import fs from "fs";

// Dossier temporaire pour les uploads
const tempDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Configuration du stockage local temporaire
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Filtrage des types de fichiers
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image uploads are allowed"), false);
};

// Création du middleware Multer
const upload = multer({ storage, fileFilter });

export default upload;
