const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const {
  createCourse,
  getMyCourses,
  getInstructorStats,
  getPublishedCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const requireAuth = require("../middleware/auth");
const requireInstructor = require("../middleware/requireInstructor");
const validate = require("../middleware/validate");

const idParam = param("id").isMongoId().withMessage("Invalid course id.");

const courseBody = [
  body("title").optional().trim().isLength({ min: 1, max: 200 }).withMessage("Title must be 1-200 characters."),
  body("description").optional().isString().isLength({ max: 10000 }).withMessage("Description is too long."),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a non-negative number."),
  body("status").optional().isIn(["draft", "publish", "archived"]).withMessage("Invalid status."),
  body("difficultyLevel").optional().isString().trim(),
  body("categories").optional().isArray().withMessage("Categories must be an array."),
  body("tags").optional().isArray().withMessage("Tags must be an array."),
];

router.get("/mine", requireAuth, getMyCourses);
router.get("/mine/stats", requireAuth, getInstructorStats);
router.get("/", getPublishedCourses);
router.post(
  "/",
  requireAuth,
  requireInstructor,
  [body("title").trim().notEmpty().withMessage("Course title is required."), ...courseBody],
  validate,
  createCourse
);
router.get("/:id", idParam, validate, getCourseById);
router.put("/:id", requireAuth, [idParam, ...courseBody], validate, updateCourse);
router.delete("/:id", requireAuth, idParam, validate, deleteCourse);

module.exports = router;
