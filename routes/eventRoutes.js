import express from "express";
const router = express.Router();
router.get("/", (req, res) => res.send("Events route OK"));
export default router;
