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

// ── MongoDB Connection (FIXED) ────────────────────────────────────────────────
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("❌ MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:");
    console.error(err.message);
    process.exit(1); // stop app if DB fails
  }
};

// ── Schema & Model ────────────────────────────────────────────────────────────
const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode:   { type: String, required: true, unique: true },
  label:       { type: String, default: "" },
  clicks:      { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now },
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

// ── Routes (UNCHANGED) ────────────────────────────────────────────────────────
app.post("/api/shorten", async (req, res) => {
  try {
    const { url, customCode, label } = req.body;

    if (!url) return res.status(400).json({ error: "URL is required." });

    try { new URL(url); } catch {
      return res.status(400).json({ error: "Invalid URL format." });
    }

    let shortCode = customCode?.trim() || generateCode();

    if (customCode && !/^[a-zA-Z0-9_-]{3,30}$/.test(shortCode)) {
      return res.status(400).json({
        error: "Custom code must be 3–30 characters.",
      });
    }

    const existing = await Url.findOne({ shortCode });
    if (existing) {
      return res.status(409).json({ error: "Code already taken." });
    }

    const entry = await Url.create({ originalUrl: url, shortCode, label });

    res.status(201).json({
      shortCode: entry.shortCode,
      shortUrl: `${BASE_URL}/${entry.shortCode}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// other routes same...

// ── START SERVER ONLY AFTER DB CONNECTS ───────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at ${BASE_URL}`);
  });
});
