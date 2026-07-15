const express = require("express");
const router = express.Router();
const { getInstructorStats, getInstructorProfile } = require("../controllers/courseController");
const requireAuth = require("../middleware/auth");

router.get("/stats", requireAuth, getInstructorStats);
router.get("/:id", requireAuth, getInstructorProfile);

module.exports = router;
