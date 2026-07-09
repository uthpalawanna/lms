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

const upload = multer({ storage, limits: { fileSize: 512 * 1024 * 1024 } });

router.post("/", requireAuth, upload.single("file"), uploadFile);

module.exports = router;