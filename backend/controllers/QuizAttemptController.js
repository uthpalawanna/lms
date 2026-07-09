const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const MAX_ATTEMPTS = 3;

async function submitAttempt(req, res) {
  try {
    const { quiz: quizId, answers } = req.body;

    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Quiz and answers are required." });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    const enrollment = await Enrollment.findOne({ student: req.userId, course: quiz.course });
    if (!enrollment) {
      return res.status(403).json({ message: "You must be enrolled in this course to take the quiz." });
    }

    const priorAttempts = await QuizAttempt.countDocuments({ student: req.userId, quiz: quizId });
    if (priorAttempts >= MAX_ATTEMPTS) {
      return res.status(403).json({ message: `You've used all ${MAX_ATTEMPTS} attempts for this quiz.` });
    }

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: "Answer count doesn't match the number of questions." });
    }

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctOptionIndex) score += 1;
    });
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    const attempt = await QuizAttempt.create({
      student: req.userId,
      quiz: quizId,
      course: quiz.course,
      answers,
      score,
      totalQuestions,
      percentage,
    });

    res.status(201).json({
      attempt,
      correctAnswers: quiz.questions.map((q) => q.correctOptionIndex),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not submit your quiz attempt." });
  }
}

async function getMyAttempts(req, res) {
  try {
    const attempts = await QuizAttempt.find({ student: req.userId })
      .populate("course", "title")
      .populate("quiz", "title")
      .sort({ createdAt: -1 });
    res.json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch your quiz attempts." });
  }
}

async function getReceivedAttempts(req, res) {
  try {
    const myCourses = await Course.find({ instructor: req.userId }).select("_id");
    const courseIds = myCourses.map((c) => c._id);

    const attempts = await QuizAttempt.find({ course: { $in: courseIds } })
      .populate("course", "title")
      .populate("quiz", "title")
      .populate("student", "firstName lastName username")
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch received quiz attempts." });
  }
}

module.exports = { submitAttempt, getMyAttempts, getReceivedAttempts };