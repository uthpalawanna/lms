const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const {
  createQuiz,
  getQuizzesForCourse,
  getQuizById,
  takeQuiz,
  getMyQuizzes,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/QuizController");
const requireAuth = require("../middleware/auth");
const requireInstructor = require("../middleware/requireInstructor");
const validate = require("../middleware/validate");

const idParam = param("id").isMongoId().withMessage("Invalid quiz id.");

const quizBody = [
  body("course").isMongoId().withMessage("A valid course id is required."),
  body("title").trim().notEmpty().withMessage("Quiz title is required."),
  body("questions").isArray({ min: 1 }).withMessage("Add at least one question."),
  body("questions.*.questionText").notEmpty().withMessage("Each question needs text."),
  body("questions.*.options").isArray({ min: 2 }).withMessage("Each question needs at least 2 options."),
  body("questions.*.correctOptionIndex").isInt({ min: 0 }).withMessage("Each question needs a valid correct answer."),
];

router.post("/", requireAuth, requireInstructor, quizBody, validate, createQuiz);
router.get("/mine/all", requireAuth, getMyQuizzes);
router.get("/course/:courseId", requireAuth, param("courseId").isMongoId(), validate, getQuizzesForCourse);
router.get("/:id/take", requireAuth, idParam, validate, takeQuiz);
router.get("/:id", requireAuth, idParam, validate, getQuizById);
router.put("/:id", requireAuth, requireInstructor, [idParam, ...quizBody], validate, updateQuiz);
router.delete("/:id", requireAuth, idParam, validate, deleteQuiz);

module.exports = router;
