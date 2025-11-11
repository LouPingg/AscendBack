import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ========= SIGNUP (whitelist only) =========
   Pré-requis: une entrée User avec { authorized: true, password: "temp" } */
export async function signup(req, res) {
  try {
    const { nickname, password } = req.body;
    const user = await User.findOne({ nickname });

    if (!user) {
      return res
        .status(403)
        .json({ message: "Nickname not found in whitelist." });
    }

    if (!user.authorized) {
      return res
        .status(403)
        .json({ message: "You are not authorized to create an account." });
    }

    // 🩹 Patch: ensure temp password is defined if missing
    if (!user.password || user.password === "") {
      user.password = "temp";
    }

    // 🧩 Check that account isn't already created
    if (user.password !== "temp") {
      return res.status(400).json({ message: "Account already created." });
    }

    // 🔐 Hash and save password
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return res.status(201).json({ message: "Account created successfully." });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Signup failed." });
  }
}

/* ========= LOGIN ========= */
export async function login(req, res) {
  try {
    const { nickname, password } = req.body;
    const user = await User.findOne({ nickname });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.authorized) {
      return res.status(403).json({ message: "User not authorized." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password." });

    const token = jwt.sign(
      { userId: user._id, role: user.role, nickname: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    return res.json({
      token,
      role: user.role,
      nickname: user.nickname,
      message: "Login successful.",
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed." });
  }
}

/* ========= AUTHORIZE USER (Admin whitelist) =========
   - Active authorized=true si l'utilisateur existe
   - S'il n'existe pas, crée une entrée pré-autorisée avec password:"temp" */
export async function authorizeUser(req, res) {
  try {
    const { nickname } = req.body;
    let user = await User.findOne({ nickname });

    if (user) {
      user.authorized = true;
      // Si pas encore de mot de passe, on force "temp"
      if (!user.password || user.password === "") {
        user.password = "temp";
      }
      await user.save();
      return res.json({ message: `${nickname} is now authorized.` });
    }

    await User.create({
      nickname,
      password: "temp",
      authorized: true,
      role: "user",
    });

    return res.json({ message: `${nickname} added to whitelist.` });
  } catch (err) {
    console.error("Authorize error:", err);
    return res.status(500).json({ message: "Error authorizing user." });
  }
}

/* ========= GET WHITELIST (Admin) ========= */
export async function getWhitelist(req, res) {
  try {
    const list = await User.find({ authorized: true }).select("nickname");
    return res.json(list);
  } catch (err) {
    console.error("Get whitelist error:", err);
    return res.status(500).json({ message: "Failed to fetch whitelist." });
  }
}

/* ========= REMOVE FROM WHITELIST (Admin) ========= */
export async function removeFromWhitelist(req, res) {
  try {
    const { nickname } = req.params;
    const user = await User.findOne({ nickname });
    if (!user) return res.status(404).json({ message: "User not found." });

    user.authorized = false;
    await user.save();
    return res.json({ message: `${nickname} removed from whitelist.` });
  } catch (err) {
    console.error("Remove whitelist error:", err);
    return res
      .status(500)
      .json({ message: "Failed to remove from whitelist." });
  }
}

/* ========= RESET PASSWORD (Admin) ========= */
export async function resetPassword(req, res) {
  try {
    const { nickname, newPassword } = req.body;
    const user = await User.findOne({ nickname });
    if (!user) return res.status(404).json({ message: "User not found." });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.json({ message: `Password for ${nickname} has been reset.` });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Password reset failed." });
  }
}

/* ========= GET ALL USERS (Admin) ========= */
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-password");
    return res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({ message: "Failed to fetch users." });
  }
}

/* ========= DELETE USER (Admin) ========= */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json({ message: `User ${user.nickname} deleted.` });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ message: "Failed to delete user." });
  }
}
