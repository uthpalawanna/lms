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

router.post("/", requireAuth, createQuiz);
router.get("/mine/all", requireAuth, getMyQuizzes);
router.get("/course/:courseId", requireAuth, getQuizzesForCourse);
router.get("/:id", requireAuth, getQuizById);
router.delete("/:id", requireAuth, deleteQuiz);

module.exports = router;