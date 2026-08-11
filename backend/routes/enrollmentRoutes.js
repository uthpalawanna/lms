const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const {
  enroll,
  getMyEnrollments,
  unenroll,
  toggleLessonComplete,
  listPendingEnrollments,
  approveEnrollment,
  rejectEnrollment,
  adminEnroll,
} = require("../controllers/enrollmentController");
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
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

router.get("/pending", requireAuth, requireAdmin, listPendingEnrollments);
router.put("/:id/approve", requireAuth, requireAdmin, idParam, validate, approveEnrollment);
router.put(
  "/:id/reject",
  requireAuth,
  requireAdmin,
  [idParam, body("reason").optional().isString()],
  validate,
  rejectEnrollment
);
router.post(
  "/admin-enroll",
  requireAuth,
  requireAdmin,
  [
    body("student").isMongoId().withMessage("A valid student id is required."),
    body("course").isMongoId().withMessage("A valid course id is required."),
  ],
  validate,
  adminEnroll
);
router.put(
  "/:id/lesson",
  requireAuth,
  [idParam, body("lessonKey").notEmpty().withMessage("lessonKey is required.")],
  validate,
  toggleLessonComplete
);
router.delete("/:id", requireAuth, idParam, validate, unenroll);

module.exports = router;