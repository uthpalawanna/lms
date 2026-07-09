const express = require("express");
const router = express.Router();
const {
  createQuiz,
  getQuizzesForCourse,
  getQuizById,
  getMyQuizzes,
  deleteQuiz,
} = require("../controllers/QuizController");
const requireAuth = require("../middleware/auth");
const requireInstructor = require("../middleware/requireInstructor");

router.post("/", requireAuth, requireInstructor, createQuiz);
router.get("/mine/all", requireAuth, getMyQuizzes);
router.get("/course/:courseId", requireAuth, getQuizzesForCourse);
router.get("/:id", requireAuth, getQuizById);
router.delete("/:id", requireAuth, deleteQuiz);

module.exports = router;