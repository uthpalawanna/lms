const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Review = require("../models/Review");
const Announcement = require("../models/Announcement");
const Wishlist = require("../models/Wishlist");
const Question = require("../models/Question");

async function cascadeDeleteCourse(courseId) {
  const quizzes = await Quiz.find({ course: courseId }).select("_id");
  const quizIds = quizzes.map((q) => q._id);
  await QuizAttempt.deleteMany({ quiz: { $in: quizIds } });
  await Quiz.deleteMany({ course: courseId });
  await Enrollment.deleteMany({ course: courseId });
  await Review.deleteMany({ course: courseId });
  await Announcement.deleteMany({ course: courseId });
  await Wishlist.deleteMany({ course: courseId });
  await Question.deleteMany({ course: courseId });
}

const EDITABLE_FIELDS = [
  "title", "slug", "description", "difficultyLevel", "isPublicPreview",
  "enableQA", "visibility", "scheduledAt", "thumbnail", "introVideoUrl",
  "price", "categories", "tags", "category", "curriculum",
  "requirements", "targetAudience", "materials", "faqs", "status",
];

function pickEditableFields(body) {
  const result = {};
  for (const key of EDITABLE_FIELDS) {
    if (body[key] !== undefined) result[key] = body[key];
  }
  return result;
}

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
    const fields = pickEditableFields(req.body);
    if (!fields.title || !fields.title.trim()) {
      return res.status(400).json({ message: "Course title is required." });
    }

    if (fields.categories && fields.categories.length > 0 && !fields.category) {
      fields.category = fields.categories[0];
    }
    const course = await Course.create({
      ...fields,
      title: fields.title.trim(),
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
    const fields = pickEditableFields(req.body);
    if (fields.categories && fields.categories.length > 0 && !fields.category) {
      fields.category = fields.categories[0];
    }
    Object.assign(course, fields);
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
    await cascadeDeleteCourse(course._id);
    await course.deleteOne();
    res.json({ message: "Course deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete the course." });
  }
}


async function getInstructorStats(req, res) {
  try {
    const courses = await Course.find({ instructor: req.userId });
    const courseIds = courses.map((c) => c._id);

    const totalCourses = courses.length;

    const enrollments = await Enrollment.find({ course: { $in: courseIds } });
    const totalStudents = new Set(
      enrollments.map((e) => e.student?.toString())
    ).size;

    const totalRevenue = enrollments.reduce((sum, e) => sum + (e.pricePaid || 0), 0);

    res.json({
      totalCourses,
      totalStudents,
      totalEnrollments: enrollments.length,
      totalRevenue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch instructor stats." });
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
  cascadeDeleteCourse,
};