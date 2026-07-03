const Quiz = require("../models/CreateQuiz");
const Course = require("../models/Course");

async function createQuiz(req, res) {
  try {
    const { course, title, questions } = req.body;

    if (!course || !title || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Course, title, and at least one question are required." });
    }

    for (const q of questions) {
      if (!q.questionText || !q.options || q.options.length < 2 || q.correctOptionIndex === undefined) {
        return res.status(400).json({ message: "Each question needs text, at least 2 options, and a correct answer." });
      }
    }

    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: "Course not found." });
    }
    if (courseDoc.instructor.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only create quizzes for your own courses." });
    }

    const quiz = await Quiz.create({
      title,
      course,
      instructor: req.userId,
      questions,
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong creating the quiz." });
  }
}

async function getQuizzesForCourse(req, res) {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId })
      .select("-questions.correctOptionIndex")
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch quizzes for this course." });
  }
}

async function getQuizForTaking(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id).select("-questions.correctOptionIndex");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }
    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch the quiz." });
  }
}

async function getQuizById(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }
    if (quiz.instructor.toString() !== req.userId) {
      return res.status(403).json({ message: "You don't own this quiz." });
    }
    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch the quiz." });
  }
}

module.exports = { createQuiz, getQuizzesForCourse, getQuizForTaking, getQuizById };