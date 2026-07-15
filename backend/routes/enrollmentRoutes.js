const express = require("express");
const router = express.Router();
const { enroll, getMyEnrollments, updateEnrollment, unenroll, toggleLessonComplete } = require("../controllers/enrollmentController");
const requireAuth = require("../middleware/auth");

router.post("/", requireAuth, enroll);
router.get("/", requireAuth, getMyEnrollments);
router.put("/:id", requireAuth, updateEnrollment);
router.put("/:id/lesson", requireAuth, toggleLessonComplete);
router.delete("/:id", requireAuth, unenroll);

module.exports = router;