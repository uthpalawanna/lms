const Review = require("../models/Review");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

async function createReview(req, res) {
  try {
    const { course, rating, comment } = req.body;
    if (!course || !rating) {
      return res.status(400).json({ message: "Course and rating are required." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: "Course not found." });

    const enrollment = await Enrollment.findOne({ student: req.userId, course });
    if (!enrollment) {
      return res.status(403).json({ message: "You can only review courses you're enrolled in." });
    }

    const existing = await Review.findOne({ student: req.userId, course });
    if (existing) {
      existing.rating = rating;
      existing.comment = comment || "";
      await existing.save();
      const populated = await existing.populate("course", "title");
      return res.json(populated);
    }

    const review = await Review.create({ student: req.userId, course, rating, comment: comment || "" });
    const populated = await review.populate("course", "title");
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not save the review." });
  }
}

async function getMyReviews(req, res) {
  try {
    const reviews = await Review.find({ student: req.userId })
      .populate("course", "title")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch your reviews." });
  }
}

async function getCourseReviews(req, res) {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate("student", "firstName lastName username")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch reviews for this course." });
  }
}

async function getReceivedReviews(req, res) {
  try {
    const Course = require("../models/Course");
    const myCourses = await Course.find({ instructor: req.userId }).select("_id");
    const courseIds = myCourses.map((c) => c._id);

    const reviews = await Review.find({ course: { $in: courseIds } })
      .populate("course", "title")
      .populate("student", "firstName lastName username")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch received reviews." });
  }
}


async function deleteReview(req, res) {
  try {
    const review = await Review.findById(req.params.id).populate("course", "instructor");
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    const isAuthor = review.student.toString() === req.userId;
    const isCourseInstructor =
      review.course?.instructor && review.course.instructor.toString() === req.userId;

    if (!isAuthor && !isCourseInstructor) {
      return res.status(403).json({ message: "You don't have permission to delete this review." });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete the review." });
  }
}

module.exports = { createReview, getMyReviews, getCourseReviews, getReceivedReviews, deleteReview };