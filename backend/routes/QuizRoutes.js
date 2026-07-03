const express = require("express");
const router = express.Router();
const {
  createQuiz,
  getQuizzesForCourse,
  getQuizForTaking,
  getQuizById,
} = require("../controllers/quizController");
const requireAuth = require("../middleware/auth");

router.post("/", requireAuth, createQuiz);
router.get("/course/:courseId", requireAuth, getQuizzesForCourse);
router.get("/:id/take", requireAuth, getQuizForTaking);
router.get("/:id", requireAuth, getQuizById);

module.exports = router;