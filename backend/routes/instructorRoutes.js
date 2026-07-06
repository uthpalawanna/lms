const express = require("express");
const router = express.Router();
const { getInstructorStats } = require("../controllers/courseController");
const requireAuth = require("../middleware/auth");

router.get("/stats", requireAuth, getInstructorStats);

module.exports = router;
