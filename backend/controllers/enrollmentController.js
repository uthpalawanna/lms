const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

async function enroll(req, res) {
  try {
    const { course } = req.body;
    if (!course) return res.status(400).json({ message: "Course is required." });

    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: "Course not found." });

    const existing = await Enrollment.findOne({ student: req.userId, course });
    if (existing) return res.status(409).json({ message: "Already enrolled in this course." });

    const enrollment = await Enrollment.create({ student: req.userId, course });
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

    const enrollments = await Enrollment.find(filter)
      .populate("course", "title thumbnail category price")
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch your enrollments." });
  }
}

async function updateEnrollment(req, res) {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found." });
    if (enrollment.student.toString() !== req.userId) {
      return res.status(403).json({ message: "This isn't your enrollment." });
    }

    const { progress, status } = req.body;
    if (progress !== undefined) {
      enrollment.progress = Math.max(0, Math.min(100, progress));
      if (enrollment.progress >= 100) enrollment.status = "completed";
    }
    if (status !== undefined) enrollment.status = status;

    await enrollment.save();
    res.json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update the enrollment." });
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

module.exports = { enroll, getMyEnrollments, updateEnrollment, unenroll };