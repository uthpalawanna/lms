const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const {
  createAnnouncement,
  getAnnouncements,
  getCourseAnnouncements,
  deleteAnnouncement,
} = require("../controllers/Announcementcontroller");
const requireAuth = require("../middleware/auth");
const requireInstructor = require("../middleware/requireInstructor");
const validate = require("../middleware/validate");

router.post(
  "/",
  requireAuth,
  requireInstructor,
  [
    body("course").isMongoId().withMessage("A valid course id is required."),
    body("title").trim().notEmpty().withMessage("Title is required."),
    body("summary").optional().isString().isLength({ max: 5000 }),
  ],
  validate,
  createAnnouncement
);
router.get("/", requireAuth, getAnnouncements);
router.get("/course/:courseId", param("courseId").isMongoId(), validate, getCourseAnnouncements);
router.delete("/:id", requireAuth, param("id").isMongoId(), validate, deleteAnnouncement);

module.exports = router;
