const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const { enroll, getMyEnrollments, updateEnrollment, unenroll, toggleLessonComplete } = require("../controllers/enrollmentController");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");

const idParam = param("id").isMongoId().withMessage("Invalid enrollment id.");

router.post(
  "/",
  requireAuth,
  [body("course").isMongoId().withMessage("A valid course id is required.")],
  validate,
  enroll
);
router.get("/", requireAuth, getMyEnrollments);
router.put("/:id", requireAuth, idParam, validate, updateEnrollment);
router.put(
  "/:id/lesson",
  requireAuth,
  [idParam, body("lessonKey").notEmpty().withMessage("lessonKey is required.")],
  validate,
  toggleLessonComplete
);
router.delete("/:id", requireAuth, idParam, validate, unenroll);

module.exports = router;
