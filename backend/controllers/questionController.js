const Question = require("../models/Question");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

async function askQuestion(req, res) {
  try {
    const { course, title, body } = req.body;

    if (!course || !title || !title.trim()) {
      return res.status(400).json({ message: "Course and title are required." });
    }

    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: "Course not found." });

    const enrollment = await Enrollment.findOne({ student: req.userId, course });
    if (!enrollment) {
      return res.status(403).json({ message: "You must be enrolled in this course to ask a question." });
    }

    const question = await Question.create({
      student: req.userId,
      course,
      title: title.trim(),
      body: body || "",
    });

    const populated = await question.populate("course", "title");
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not submit your question." });
  }
}

async function getMyQuestions(req, res) {
  try {
    const questions = await Question.find({ student: req.userId })
      .populate("course", "title")
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch your questions." });
  }
}

async function getReceivedQuestions(req, res) {
  try {
    const myCourses = await Course.find({ instructor: req.userId }).select("_id");
    const courseIds = myCourses.map((c) => c._id);

    const questions = await Question.find({ course: { $in: courseIds } })
      .populate("course", "title")
      .populate("student", "firstName lastName username")
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch received questions." });
  }
}

async function answerQuestion(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Answer text is required." });
    }

    const question = await Question.findById(req.params.id).populate("course", "instructor");
    if (!question) return res.status(404).json({ message: "Question not found." });

    const isCourseInstructor =
      question.course?.instructor && question.course.instructor.toString() === req.userId;
    const isEnrolledClassmate = await Enrollment.findOne({ student: req.userId, course: question.course?._id });

    if (!isCourseInstructor && !isEnrolledClassmate) {
      return res.status(403).json({ message: "You must be the instructor or enrolled in this course to answer." });
    }

    question.answers.push({ responder: req.userId, text: text.trim() });
    await question.save();

    res.status(201).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not submit your answer." });
  }
}

async function deleteQuestion(req, res) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found." });
    if (question.student.toString() !== req.userId) {
      return res.status(403).json({ message: "You don't own this question." });
    }
    await question.deleteOne();
    res.json({ message: "Question deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete the question." });
  }
}

module.exports = {
  askQuestion,
  getMyQuestions,
  getReceivedQuestions,
  answerQuestion,
  deleteQuestion,
};
