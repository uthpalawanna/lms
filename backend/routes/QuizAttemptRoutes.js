const express = require("express");
const router = express.Router();
const {
  submitAttempt,
  getMyAttempts,
  getReceivedAttempts,
} = require("../controllers/QuizAttemptController");
const requireAuth = require("../middleware/auth");

router.post("/", requireAuth, submitAttempt);
router.get("/mine", requireAuth, getMyAttempts);
router.get("/received", requireAuth, getReceivedAttempts);

module.exports = router;