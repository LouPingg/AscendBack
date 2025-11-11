import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ========= SIGNUP ========= */
export async function signup(req, res) {
  try {
    const { nickname, password } = req.body;
    const user = await User.findOne({ nickname });

    if (!user)
      return res
        .status(403)
        .json({ message: "Nickname not found in whitelist." });
    if (!user.authorized)
      return res
        .status(403)
        .json({ message: "You are not authorized to create an account." });

    if (!user.password || user.password === "") user.password = "temp";
    if (user.password !== "temp")
      return res.status(400).json({ message: "Account already created." });

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.status(201).json({ message: "Account created successfully." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed." });
  }
}

/* ========= LOGIN ========= */
export async function login(req, res) {
  try {
    const { nickname, password } = req.body;
    const user = await User.findOne({ nickname });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.authorized)
      return res.status(403).json({ message: "User not authorized." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password." });

    const token = jwt.sign(
      { userId: user._id, role: user.role, nickname: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.json({
      token,
      role: user.role,
      nickname: user.nickname,
      message: "Login successful.",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed." });
  }
}

/* ========= ADMIN: AUTHORIZE / WHITELIST ========= */
export async function authorizeUser(req, res) {
  try {
    const { nickname } = req.body;
    let user = await User.findOne({ nickname });

    if (user) {
      user.authorized = true;
      if (!user.password || user.password === "") user.password = "temp";
      await user.save();
      return res.json({ message: `${nickname} is now authorized.` });
    }

    await User.create({
      nickname,
      password: "temp",
      authorized: true,
      role: "user",
    });
    res.json({ message: `${nickname} added to whitelist.` });
  } catch (err) {
    console.error("Authorize error:", err);
    res.status(500).json({ message: "Error authorizing user." });
  }
}

/* ========= ADMIN: LIST / REMOVE ========= */
export async function getWhitelist(req, res) {
  try {
    const list = await User.find({ authorized: true }).select("nickname");
    res.json(list);
  } catch (err) {
    console.error("Get whitelist error:", err);
    res.status(500).json({ message: "Failed to fetch whitelist." });
  }
}

export async function removeFromWhitelist(req, res) {
  try {
    const { nickname } = req.params;
    const user = await User.findOne({ nickname });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.authorized = false;
    await user.save();
    res.json({ message: `${nickname} removed from whitelist.` });
  } catch (err) {
    console.error("Remove whitelist error:", err);
    res.status(500).json({ message: "Failed to remove from whitelist." });
  }
}
