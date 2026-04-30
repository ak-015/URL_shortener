require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── MongoDB Connection ────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/urlshortener")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ── Schema & Model ────────────────────────────────────────────────────────────
const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode:   { type: String, required: true, unique: true },
  label:       { type: String, default: "" },          // e.g. "Resume", "LinkedIn"
  clicks:      { type: Number, default: 0 },
  createdAt:   { type: Date,   default: Date.now },
  lastClickAt: { type: Date },
});

const Url = mongoose.model("Url", urlSchema);

// ── Helper ────────────────────────────────────────────────────────────────────
function generateCode(len = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// ── API Routes ────────────────────────────────────────────────────────────────

// POST /api/shorten  — create a short URL
app.post("/api/shorten", async (req, res) => {
  try {
    const { url, customCode, label } = req.body;

    if (!url) return res.status(400).json({ error: "URL is required." });

    // Basic URL validation
    try { new URL(url); } catch {
      return res.status(400).json({ error: "Invalid URL format." });
    }

    let shortCode = customCode?.trim() || generateCode();

    // Validate custom code format
    if (customCode && !/^[a-zA-Z0-9_-]{3,30}$/.test(shortCode)) {
      return res.status(400).json({
        error: "Custom code must be 3–30 characters (letters, numbers, _ -).",
      });
    }

    // Check uniqueness
    const existing = await Url.findOne({ shortCode });
    if (existing) {
      return res.status(409).json({ error: "That short code is already taken." });
    }

    const entry = await Url.create({ originalUrl: url, shortCode, label });
    return res.status(201).json({
      shortCode: entry.shortCode,
      shortUrl:  `${BASE_URL}/${entry.shortCode}`,
      label:     entry.label,
      clicks:    entry.clicks,
      createdAt: entry.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// GET /api/links  — list all shortened links
app.get("/api/links", async (_req, res) => {
  try {
    const links = await Url.find().sort({ createdAt: -1 });
    res.json(
      links.map((l) => ({
        id:          l._id,
        originalUrl: l.originalUrl,
        shortCode:   l.shortCode,
        shortUrl:    `${BASE_URL}/${l.shortCode}`,
        label:       l.label,
        clicks:      l.clicks,
        createdAt:   l.createdAt,
        lastClickAt: l.lastClickAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// GET /api/links/:code/stats  — stats for one link
app.get("/api/links/:code/stats", async (req, res) => {
  try {
    const entry = await Url.findOne({ shortCode: req.params.code });
    if (!entry) return res.status(404).json({ error: "Short URL not found." });
    res.json({
      originalUrl: entry.originalUrl,
      shortCode:   entry.shortCode,
      shortUrl:    `${BASE_URL}/${entry.shortCode}`,
      label:       entry.label,
      clicks:      entry.clicks,
      createdAt:   entry.createdAt,
      lastClickAt: entry.lastClickAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// DELETE /api/links/:code  — remove a link
app.delete("/api/links/:code", async (req, res) => {
  try {
    const result = await Url.findOneAndDelete({ shortCode: req.params.code });
    if (!result) return res.status(404).json({ error: "Short URL not found." });
    res.json({ message: "Deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// ── Redirect Route ────────────────────────────────────────────────────────────
app.get("/:code", async (req, res, next) => {
  // Skip if it looks like a static file or API call
  if (req.params.code.includes(".") || req.params.code === "api") return next();

  try {
    const entry = await Url.findOneAndUpdate(
      { shortCode: req.params.code },
      { $inc: { clicks: 1 }, $set: { lastClickAt: new Date() } },
      { new: true }
    );
    if (!entry) return res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
    return res.redirect(302, entry.originalUrl);
  } catch (err) {
    next(err);
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at ${BASE_URL}`);
});
