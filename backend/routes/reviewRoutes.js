const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const {
  createReview,
  getMyReviews,
  getCourseReviews,
  getReceivedReviews,
  deleteReview,
} = require("../controllers/Reviewcontroller");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");

router.post(
  "/",
  requireAuth,
  [
    body("course").isMongoId().withMessage("A valid course id is required."),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be an integer between 1 and 5."),
    body("comment").optional().isString().isLength({ max: 2000 }).withMessage("Comment is too long."),
  ],
  validate,
  createReview
);
router.get("/mine", requireAuth, getMyReviews);
router.get("/received", requireAuth, getReceivedReviews);
router.get("/course/:courseId", param("courseId").isMongoId(), validate, getCourseReviews);
router.delete("/:id", requireAuth, param("id").isMongoId(), validate, deleteReview);

module.exports = router;
