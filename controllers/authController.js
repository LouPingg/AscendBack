import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ========= SIGNUP ========= */
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

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { userId: user._id, role: user.role, nickname: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.json({ token, nickname: user.nickname, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
}

/* ========= ADMIN: AUTHORIZE USER ========= */
export async function authorizeUser(req, res) {
  try {
    const { nickname } = req.body;
    let user = await User.findOne({ nickname });
    if (!user) {
      user = await User.create({
        nickname,
        password: "temp",
        authorized: true,
        role: "user",
      });
    } else {
      user.authorized = true;
      if (!user.password || user.password === "") user.password = "temp";
      await user.save();
    }
    res.json({ message: `${nickname} authorized` });
  } catch (err) {
    console.error("Authorize error:", err);
    res.status(500).json({ message: "Error authorizing user" });
  }
}

/* ========= ADMIN: GET WHITELIST ========= */
export async function getWhitelist(req, res) {
  try {
    const list = await User.find({ authorized: true }).select("nickname");
    res.json(list);
  } catch (err) {
    console.error("Get whitelist error:", err);
    res.status(500).json({ message: "Failed to fetch whitelist" });
  }
}

/* ========= ADMIN: REMOVE FROM WHITELIST ========= */
export async function removeFromWhitelist(req, res) {
  try {
    const { nickname } = req.params;
    const user = await User.findOne({ nickname });
    if (!user)
      return res.status(404).json({ message: "User not found in whitelist" });

    user.authorized = false;
    await user.save();
    res.json({ message: `${nickname} removed from whitelist` });
  } catch (err) {
    console.error("Remove whitelist error:", err);
    res.status(500).json({ message: "Failed to remove from whitelist" });
  }
}

/* ========= ADMIN: RESET PASSWORD ========= */
export async function resetPassword(req, res) {
  try {
    const { nickname, newPassword } = req.body;
    const user = await User.findOne({ nickname });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: `Password for ${nickname} has been reset` });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
}

/* ========= ADMIN: GET ALL USERS ========= */
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("nickname role authorized");
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

/* ========= ADMIN: DELETE USER ========= */
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
