const express = require("express");
const router = express.Router();
const { param } = require("express-validator");
const { getInstructorStats, getInstructorProfile } = require("../controllers/courseController");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");

router.get("/stats", requireAuth, getInstructorStats);
router.get("/:id", requireAuth, param("id").isMongoId().withMessage("Invalid instructor id."), validate, getInstructorProfile);

module.exports = router;
