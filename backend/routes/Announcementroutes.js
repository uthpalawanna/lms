const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} = require("../controllers/Announcementcontroller");
const requireAuth = require("../middleware/auth");

router.post("/", requireAuth, createAnnouncement);
router.get("/", requireAuth, getAnnouncements);
router.delete("/:id", requireAuth, deleteAnnouncement);

module.exports = router;