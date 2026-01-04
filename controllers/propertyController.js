import fs from "fs";
import Property from "../models/Property.js";
import cloudinary from "../config/cloudinary.js";
import { PROPERTY_TAGS } from "../config/propertyTags.js";

// ✅ helper validation
function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  // allow "a,b,c"
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

function validateTags(tags) {
  return tags.every((t) => PROPERTY_TAGS.includes(t));
}

// GET /api/properties/tags
export async function getPropertyTags(req, res) {
  res.json(PROPERTY_TAGS);
}

// GET /api/properties?tag=house OR ?creator=Nick
export async function getAllProperties(req, res) {
  try {
    const { tag, creator } = req.query;

    const filter = {};
    if (tag) filter.tags = tag;

    // Filter by creator nickname (simple)
    // We populate then filter in memory if creator provided.
    // (Optimizable later with aggregation)
    const properties = await Property.find(filter)
      .populate("createdBy", "nickname role")
      .sort({ createdAt: -1 });

    if (creator) {
      const lowered = creator.toLowerCase();
      return res.json(
        properties.filter((p) =>
          (p.createdBy?.nickname || "").toLowerCase().includes(lowered)
        )
      );
    }

    res.json(properties);
  } catch (err) {
    console.error("Get properties error:", err);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
}

// POST /api/properties (auth + image optional)
export async function createProperty(req, res) {
  try {
    const { title, description } = req.body;
    const tags = normalizeTags(req.body.tags);

    if (!title?.trim() || !description?.trim()) {
      return res
        .status(400)
        .json({ message: "Title and description required" });
    }

    if (!validateTags(tags)) {
      return res.status(400).json({
        message: "Invalid tags provided",
        allowed: PROPERTY_TAGS,
      });
    }

    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      const up = await cloudinary.uploader.upload(req.file.path, {
        folder: "ascend-properties",
      });
      imageUrl = up.secure_url;
      imagePublicId = up.public_id;

      // ✅ delete temp file
      await fs.promises.unlink(req.file.path);
    }

    const property = await Property.create({
      title: title.trim(),
      description: description.trim(),
      tags,
      imageUrl,
      imagePublicId,
      createdBy: req.user.userId, // from verifyToken
    });

    res.status(201).json(property);
  } catch (err) {
    console.error("Create property error:", err);
    res.status(500).json({ message: "Failed to create property" });
  }
}

// DELETE /api/properties/:id (owner/admin)
export async function deleteProperty(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    const isOwner = property.createdBy?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (property.imagePublicId) {
      await cloudinary.uploader.destroy(property.imagePublicId);
    }

    await property.deleteOne();
    res.json({ message: "Property deleted" });
  } catch (err) {
    console.error("Delete property error:", err);
    res.status(500).json({ message: "Failed to delete property" });
  }
}
