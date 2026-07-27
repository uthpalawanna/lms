const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  submitAttempt,
  getMyAttempts,
  getReceivedAttempts,
} = require("../controllers/QuizAttemptController");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");

router.post(
  "/",
  requireAuth,
  [
    body("quiz").isMongoId().withMessage("A valid quiz id is required."),
    body("answers").isArray().withMessage("Answers must be an array."),
  ],
  validate,
  submitAttempt
);
router.get("/mine", requireAuth, getMyAttempts);
router.get("/received", requireAuth, getReceivedAttempts);

module.exports = router;
