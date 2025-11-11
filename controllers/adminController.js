import bcrypt from "bcrypt";
import User from "../models/User.js";
import Whitelist from "../models/Whitelist.js";

// ➕ Ajouter un pseudo à la whitelist
export const addToWhitelist = async (req, res) => {
  try {
    const { nickname } = req.body;
    if (!nickname)
      return res.status(400).json({ message: "Nickname required" });

    const exists = await Whitelist.findOne({ nickname });
    if (exists) return res.status(400).json({ message: "Already whitelisted" });

    await Whitelist.create({ nickname });
    res.json({ message: `${nickname} added to whitelist` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔑 Réinitialiser le mot de passe
export const resetPassword = async (req, res) => {
  try {
    const { nickname, newPassword } = req.body;
    if (!nickname || !newPassword)
      return res
        .status(400)
        .json({ message: "Nickname and password required" });

    const user = await User.findOne({ nickname });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: `Password reset for ${nickname}` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📋 Liste des utilisateurs
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // cache le mdp
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* === GET WHITELIST === */
export const getWhitelist = async (req, res) => {
  try {
    const entries = await Whitelist.find().sort({ nickname: 1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch whitelist" });
  }
};

/* === REMOVE FROM WHITELIST === */
export const removeFromWhitelist = async (req, res) => {
  try {
    const { nickname } = req.params;
    const entry = await Whitelist.findOneAndDelete({ nickname });
    if (!entry)
      return res.status(404).json({ message: "User not in whitelist" });
    res.json({ message: `${nickname} removed from whitelist` });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove from whitelist" });
  }
};
