const express = require("express");
const router = express.Router();
const {
  createReview,
  getMyReviews,
  getCourseReviews,
  getReceivedReviews,
  deleteReview,
} = require("../controllers/reviewController");
const requireAuth = require("../middleware/auth");

router.post("/", requireAuth, createReview);
router.get("/mine", requireAuth, getMyReviews);
router.get("/received", requireAuth, getReceivedReviews);
router.get("/course/:courseId", getCourseReviews);
router.delete("/:id", requireAuth, deleteReview);

module.exports = router;