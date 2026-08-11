const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");
const { notifyUser, notifyUsers } = require("../utils/notify");

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
    if (existing) {
      if (existing.status === "rejected") {
        return res.status(409).json({
          message: "Your previous request for this course was rejected. Contact an admin for details.",
        });
      }
      return res.status(409).json({ message: "Already enrolled in this course." });
    }

    // Free courses enroll instantly — approval is only required for paid courses.
    const enrollment = await Enrollment.create({
      student: req.userId,
      course,
      pricePaid: 0,
      status: "active",
    });

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

async function listPendingEnrollments(req, res) {
  try {
    const enrollments = await Enrollment.find({ status: "pending" })
      .populate("student", "firstName lastName username email")
      .populate("course", "title thumbnail category price")
      .sort({ createdAt: 1 });

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch pending enrollment requests." });
  }
}

async function approveEnrollment(req, res) {
  try {
    const enrollment = await Enrollment.findById(req.params.id).populate("course", "title");
    if (!enrollment) return res.status(404).json({ message: "Enrollment request not found." });
    if (enrollment.status !== "pending") {
      return res.status(400).json({ message: "This request has already been reviewed." });
    }

    enrollment.status = "active";
    enrollment.reviewedBy = req.userId;
    enrollment.reviewedAt = new Date();
    await enrollment.save();

    await notifyUser({
      recipient: enrollment.student,
      type: "enrollment",
      title: "Enrollment approved",
      body: `You're now enrolled in ${enrollment.course.title}.`,
      course: enrollment.course._id,
    });

    res.json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not approve the enrollment request." });
  }
}

async function rejectEnrollment(req, res) {
  try {
    const { reason } = req.body;
    const enrollment = await Enrollment.findById(req.params.id).populate("course", "title");
    if (!enrollment) return res.status(404).json({ message: "Enrollment request not found." });
    if (enrollment.status !== "pending") {
      return res.status(400).json({ message: "This request has already been reviewed." });
    }

    enrollment.status = "rejected";
    enrollment.reviewedBy = req.userId;
    enrollment.reviewedAt = new Date();
    enrollment.rejectionReason = reason || "";
    await enrollment.save();

    await notifyUser({
      recipient: enrollment.student,
      type: "enrollment",
      title: "Enrollment request declined",
      body: reason
        ? `Your request to join ${enrollment.course.title} was declined: ${reason}`
        : `Your request to join ${enrollment.course.title} was declined.`,
      course: enrollment.course._id,
    });

    res.json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not reject the enrollment request." });
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
    if (enrollment.status === "pending") {
      return res.status(403).json({ message: "This enrollment is still pending admin approval." });
    }
    if (enrollment.status === "rejected") {
      return res.status(403).json({ message: "This enrollment request was rejected." });
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

async function adminEnroll(req, res) {
  try {
    const { student, course } = req.body;
    if (!student || !course) {
      return res.status(400).json({ message: "Student and course are required." });
    }

    const [studentDoc, courseDoc] = await Promise.all([
      User.findById(student),
      Course.findById(course),
    ]);
    if (!studentDoc) return res.status(404).json({ message: "Student not found." });
    if (!courseDoc) return res.status(404).json({ message: "Course not found." });

    const existing = await Enrollment.findOne({ student, course });
    if (existing) {
      if (existing.status === "active" || existing.status === "completed") {
        return res.status(409).json({ message: "Student is already enrolled in this course." });
      }
      // A pending or rejected request already exists — approve it in place
      // instead of creating a duplicate.
      existing.status = "active";
      existing.pricePaid = 0;
      existing.reviewedBy = req.userId;
      existing.reviewedAt = new Date();
      existing.rejectionReason = "";
      await existing.save();

      await notifyUser({
        recipient: student,
        type: "enrollment",
        title: "Enrolled by admin",
        body: `An admin has enrolled you in ${courseDoc.title} at no charge.`,
        course,
      });

      const populated = await existing.populate("course", "title thumbnail category price");
      return res.status(200).json(populated);
    }

    const enrollment = await Enrollment.create({
      student,
      course,
      pricePaid: 0,
      status: "active",
      reviewedBy: req.userId,
      reviewedAt: new Date(),
    });

    await notifyUser({
      recipient: student,
      type: "enrollment",
      title: "Enrolled by admin",
      body: `An admin has enrolled you in ${courseDoc.title} at no charge.`,
      course,
    });

    const populated = await enrollment.populate("course", "title thumbnail category price");
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not enroll the student." });
  }
}

module.exports = {
  enroll,
  getMyEnrollments,
  unenroll,
  toggleLessonComplete,
  listPendingEnrollments,
  approveEnrollment,
  rejectEnrollment,
  adminEnroll,
};