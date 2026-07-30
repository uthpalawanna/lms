const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const { getMyNotifications, markAllRead } = require("../controllers/notificationController");

router.get("/mine", requireAuth, getMyNotifications);
router.patch("/read-all", requireAuth, markAllRead);

module.exports = router;