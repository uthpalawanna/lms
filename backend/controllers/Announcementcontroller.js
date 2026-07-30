const Announcement = require("../models/Announcement");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { notifyUsers } = require("../utils/notify");

async function createAnnouncement(req, res) {
  try {
    const { course, title, summary } = req.body;

    if (!course || !title || !title.trim()) {
      return res.status(400).json({ message: "Course and title are required." });
    }

    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: "Course not found." });
    }
    if (courseDoc.instructor.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only post announcements for your own courses." });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      summary: summary || "",
      course,
      instructor: req.userId,
    });

    const enrollments = await Enrollment.find({ course }).select("student");
    await notifyUsers(
      enrollments.map((e) => e.student),
      {
        type: "announcement",
        title: courseDoc.title,
        body: announcement.title,
        course,
      }
    );

    const populated = await announcement.populate("course", "title");
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong while creating the announcement." });
  }
}

async function getAnnouncements(req, res) {
  try {
    const filter = { instructor: req.userId };
    if (req.query.course && req.query.course !== "all") {
      filter.course = req.query.course;
    }

    const announcements = await Announcement.find(filter)
      .populate("course", "title")
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch announcements." });
  }
}

async function deleteAnnouncement(req, res) {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found." });
    }
    if (announcement.instructor.toString() !== req.userId) {
      return res.status(403).json({ message: "You don't own this announcement." });
    }
    await announcement.deleteOne();
    res.json({ message: "Announcement deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete the announcement." });
  }
}

async function getCourseAnnouncements(req, res) {
  try {
    const announcements = await Announcement.find({ course: req.params.courseId })
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch announcements for this course." });
  }
}

async function getMyAnnouncements(req, res) {
  try {
    const enrollments = await Enrollment.find({ student: req.userId }).select("course");
    const courseIds = enrollments.map((e) => e.course);

    if (courseIds.length === 0) {
      return res.json([]);
    }

    const announcements = await Announcement.find({ course: { $in: courseIds } })
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch your notifications." });
  }
}

module.exports = { createAnnouncement, getAnnouncements, getCourseAnnouncements, deleteAnnouncement, getMyAnnouncements };