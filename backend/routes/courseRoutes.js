const express = require("express");
const router = express.Router();
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

router.get("/mine", requireAuth, getMyCourses);
router.get("/mine/stats", requireAuth, getInstructorStats);
router.get("/", getPublishedCourses);
router.post("/", requireAuth, requireInstructor, createCourse);
router.get("/:id", getCourseById);
router.put("/:id", requireAuth, updateCourse);
router.delete("/:id", requireAuth, deleteCourse);

module.exports = router;