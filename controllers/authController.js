import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ========= SIGNUP (whitelisted only) ========= */
export async function signup(req, res) {
  try {
    const { nickname, password } = req.body;
    const user = await User.findOne({ nickname });

    if (!user || !user.authorized)
      return res
        .status(403)
        .json({ message: "You are not authorized to create an account." });

    if (user.password !== "temp")
      return res.status(400).json({ message: "Account already created." });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
}

/* ========= LOGIN ========= */
export async function login(req, res) {
  try {
    const { nickname, password } = req.body;
    const user = await User.findOne({ nickname });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🟡 AJOUTE CES 2 LIGNES TEMPORAIRES
    console.log("🔹 Mot de passe reçu:", password);
    console.log("🔹 Hash en base:", user.password);

    const match = await bcrypt.compare(password, user.password);
    console.log("🔹 Résultat comparaison:", match);

    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.json({ token, role: user.role, nickname: user.nickname });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
}

/* ========= AUTHORIZE USER (Admin whitelist) ========= */
export async function authorizeUser(req, res) {
  try {
    const { nickname } = req.body;

    // Vérifie si un utilisateur existe déjà
    const existing = await User.findOne({ nickname });
    if (existing) {
      existing.authorized = true;
      await existing.save();
      return res.json({ message: `${nickname} is now authorized.` });
    }

    // Sinon, on crée une entrée "pré-autorisée"
    await User.create({
      nickname,
      password: "temp",
      authorized: true,
      role: "user",
    });

    res.json({ message: `${nickname} added to whitelist.` });
  } catch (err) {
    console.error("Authorize error:", err);
    res.status(500).json({ message: "Error authorizing user" });
  }
}

/* ========= RESET PASSWORD (Admin) ========= */
export async function resetPassword(req, res) {
  try {
    const { nickname, newPassword } = req.body;
    const user = await User.findOne({ nickname });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: `Password for ${nickname} has been reset.` });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Password reset failed" });
  }
}

/* ========= GET USERS (Admin only) ========= */
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

/* ========= DELETE USER (Admin) ========= */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `User ${user.nickname} deleted.` });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
}
