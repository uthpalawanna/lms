const Quiz = require("../models/Quiz");
const Course = require("../models/Course");

async function createQuiz(req, res) {
  try {
    const { course, title, questions } = req.body;

    if (!course || !title || !title.trim()) {
      return res.status(400).json({ message: "Course and title are required." });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Add at least one question." });
    }
    for (const q of questions) {
      if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ message: "Each question needs text and at least 2 options." });
      }
      if (
        q.correctOptionIndex === undefined ||
        q.correctOptionIndex < 0 ||
        q.correctOptionIndex >= q.options.length
      ) {
        return res.status(400).json({ message: "Each question needs a valid correct answer selected." });
      }
    }

    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: "Course not found." });
    if (courseDoc.instructor.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only add quizzes to your own courses." });
    }

    const quiz = await Quiz.create({
      title: title.trim(),
      course,
      instructor: req.userId,
      questions,
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create the quiz." });
  }
}

async function getQuizzesForCourse(req, res) {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId }).sort({ createdAt: -1 });

    const isOwner =
      quizzes.length > 0 && quizzes[0].instructor.toString() === req.userId;

    if (isOwner) {
      return res.json(quizzes);
    }

    const sanitized = quizzes.map((quiz) => ({
      _id: quiz._id,
      title: quiz.title,
      course: quiz.course,
      questions: quiz.questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
      })),
    }));
    res.json(sanitized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch quizzes for this course." });
  }
}

async function getQuizById(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    if (quiz.instructor.toString() === req.userId) {
      return res.json(quiz);
    }

    res.json({
      _id: quiz._id,
      title: quiz.title,
      course: quiz.course,
      questions: quiz.questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch the quiz." });
  }
}

async function getMyQuizzes(req, res) {
  try {
    const quizzes = await Quiz.find({ instructor: req.userId })
      .populate("course", "title")
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch your quizzes." });
  }
}

async function deleteQuiz(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    if (quiz.instructor.toString() !== req.userId) {
      return res.status(403).json({ message: "You don't own this quiz." });
    }
    await quiz.deleteOne();
    res.json({ message: "Quiz deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete the quiz." });
  }
}

module.exports = {
  createQuiz,
  getQuizzesForCourse,
  getQuizById,
  getMyQuizzes,
  deleteQuiz,
};