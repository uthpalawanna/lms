const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const { notifyUser } = require("../utils/notify");

async function enroll(req, res) {
  try {
    const { course } = req.body;
    if (!course) return res.status(400).json({ message: "Course is required." });

    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: "Course not found." });

    if (courseDoc.price > 0) {
      return res.status(402).json({ message: "This course requires payment. Use checkout instead." });
    }

    const existing = await Enrollment.findOne({ student: req.userId, course });
    if (existing) return res.status(409).json({ message: "Already enrolled in this course." });

    const enrollment = await Enrollment.create({ student: req.userId, course, pricePaid: 0 });
    await notifyUser({
      recipient: req.userId,
      type: "enrollment",
      title: "Enrollment confirmed",
      body: `You're now enrolled in ${courseDoc.title}.`,
      course,
    });
    const populated = await enrollment.populate("course", "title thumbnail category price");
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not enroll in the course." });
  }
}

async function getMyEnrollments(req, res) {
  try {
    const filter = { student: req.userId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.course) filter.course = req.query.course;

    const enrollments = await Enrollment.find(filter)
      .populate("course", "title thumbnail category price")
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch your enrollments." });
  }
}

async function unenroll(req, res) {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found." });
    if (enrollment.student.toString() !== req.userId) {
      return res.status(403).json({ message: "This isn't your enrollment." });
    }

    await enrollment.deleteOne();
    res.json({ message: "Unenrolled successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not unenroll from the course." });
  }
}

async function toggleLessonComplete(req, res) {
  try {
    const enrollment = await Enrollment.findById(req.params.id).populate("course", "curriculum");
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found." });
    if (enrollment.student.toString() !== req.userId) {
      return res.status(403).json({ message: "This isn't your enrollment." });
    }

    const { lessonKey, completed } = req.body;
    if (!lessonKey) return res.status(400).json({ message: "lessonKey is required." });

    const alreadyDone = enrollment.completedLessons.includes(lessonKey);
    if (completed && !alreadyDone) {
      enrollment.completedLessons.push(lessonKey);
    } else if (!completed && alreadyDone) {
      enrollment.completedLessons = enrollment.completedLessons.filter((k) => k !== lessonKey);
    }

    const totalLessons = (enrollment.course?.curriculum || []).reduce(
      (sum, topic) => sum + (topic.lessons?.length || 0),
      0
    );

    enrollment.progress = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;
    enrollment.status = enrollment.progress >= 100 ? "completed" : "active";

    await enrollment.save();
    res.json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update lesson progress." });
  }
}

module.exports = { enroll, getMyEnrollments, unenroll, toggleLessonComplete };