const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

async function getPublishedCourses(req, res) {
  try {
    const courses = await Course.find({ status: "publish" })
      .populate("instructor", "firstName lastName username")
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch courses." });
  }
}

async function createCourse(req, res) {
  try {
    const { title, description, category, price, thumbnail, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Course title is required." });
    }

    const course = await Course.create({
      title: title.trim(),
      description: description || "",
      category: category || "Uncategorized",
      price: price || 0,
      thumbnail: thumbnail || "",
      status: status || "draft",
      instructor: req.userId,
    });

    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong while creating the course." });
  }
}

async function getMyCourses(req, res) {
  try {
    const courses = await Course.find({ instructor: req.userId }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch your courses." });
  }
}

async function getInstructorStats(req, res) {
  try {
    const myCourses = await Course.find({ instructor: req.userId }, "_id price");
    const courseIds = myCourses.map((c) => c._id);

    if (courseIds.length === 0) {
      return res.json({ totalCourses: 0, totalStudents: 0, totalEarnings: 0 });
    }

    const priceByCourseId = {};
    myCourses.forEach((c) => {
      priceByCourseId[c._id.toString()] = c.price || 0;
    });

    const enrollments = await Enrollment.find(
      { course: { $in: courseIds } },
      "student course"
    );

    const uniqueStudentIds = new Set(enrollments.map((e) => e.student.toString()));
    const totalEarnings = enrollments.reduce(
      (sum, e) => sum + (priceByCourseId[e.course.toString()] || 0),
      0
    );

    res.json({
      totalCourses: myCourses.length,
      totalStudents: uniqueStudentIds.size,
      totalEarnings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch instructor stats." });
  }
}

async function getCourseById(req, res) {
  try {
    const course = await Course.findById(req.params.id).populate(
      "instructor",
      "firstName lastName username avatarUrl bio"
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch the course." });
  }
}

async function updateCourse(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    if (course.instructor.toString() !== req.userId) {
      return res.status(403).json({ message: "You don't own this course." });
    }

    const { title, description, category, price, thumbnail, status } = req.body;
    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (category !== undefined) course.category = category;
    if (price !== undefined) course.price = price;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (status !== undefined) course.status = status;

    await course.save();
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update the course." });
  }
}

async function deleteCourse(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    if (course.instructor.toString() !== req.userId) {
      return res.status(403).json({ message: "You don't own this course." });
    }

    await course.deleteOne();
    res.json({ message: "Course deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete the course." });
  }
}

module.exports = {
  createCourse,
  getMyCourses,
  getInstructorStats,
  getPublishedCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};