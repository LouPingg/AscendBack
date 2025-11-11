import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function signup(req, res) {
  try {
    const { nickname, password } = req.body;
    const user = await User.findOne({ nickname });
    if (!user) return res.status(403).json({ message: "Not whitelisted" });
    if (!user.authorized)
      return res.status(403).json({ message: "Unauthorized" });
    if (user.password !== "temp")
      return res.status(400).json({ message: "Account already exists" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.status(201).json({ message: "Account created" });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
}

export async function login(req, res) {
  try {
    const { nickname, password } = req.body;
    const user = await User.findOne({ nickname });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { userId: user._id, role: user.role, nickname: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );
    res.json({ token, nickname: user.nickname, role: user.role });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
}

export async function authorizeUser(req, res) {
  try {
    const { nickname } = req.body;
    let user = await User.findOne({ nickname });
    if (!user)
      user = await User.create({
        nickname,
        password: "temp",
        authorized: true,
      });
    else {
      user.authorized = true;
      if (!user.password || user.password === "") user.password = "temp";
      await user.save();
    }
    res.json({ message: `${nickname} authorized` });
  } catch {
    res.status(500).json({ message: "Error authorizing user" });
  }
}

// === ADMIN: supprimer un utilisateur ===
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
}
