const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { uploadFile } = require("../controllers/uploadController");
const requireAuth = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// Only allow the file types the LMS actually uses (thumbnails, intro/lesson
// videos, course materials). This is served statically from /uploads, so
// letting arbitrary file types through (e.g. .html, .exe) would be a stored
// XSS / malware-hosting risk.
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "application/pdf",
]);

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error("Unsupported file type."));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB — plenty for lesson videos, far less than 512MB
});

router.post("/", requireAuth, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed." });
    }
    next();
  });
}, uploadFile);

module.exports = router;