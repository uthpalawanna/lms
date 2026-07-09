const express = require("express");
const router = express.Router();
const {
  askQuestion,
  getMyQuestions,
  getReceivedQuestions,
  answerQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const requireAuth = require("../middleware/auth");

router.post("/", requireAuth, askQuestion);
router.get("/mine", requireAuth, getMyQuestions);
router.get("/received", requireAuth, getReceivedQuestions);
router.post("/:id/answer", requireAuth, answerQuestion);
router.delete("/:id", requireAuth, deleteQuestion);

module.exports = router;
