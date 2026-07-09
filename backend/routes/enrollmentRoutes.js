const express = require("express");
const router = express.Router();
const { enroll, getMyEnrollments, updateEnrollment, unenroll } = require("../controllers/enrollmentController");
const requireAuth = require("../middleware/auth");

router.post("/", requireAuth, enroll);
router.get("/", requireAuth, getMyEnrollments);
router.put("/:id", requireAuth, updateEnrollment);
router.delete("/:id", requireAuth, unenroll);

module.exports = router;