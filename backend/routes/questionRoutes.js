const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const {
  askQuestion,
  getMyQuestions,
  getReceivedQuestions,
  answerQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");

router.post(
  "/",
  requireAuth,
  [
    body("course").isMongoId().withMessage("A valid course id is required."),
    body("title").trim().notEmpty().withMessage("Title is required."),
    body("body").optional().isString().isLength({ max: 5000 }),
  ],
  validate,
  askQuestion
);
router.get("/mine", requireAuth, getMyQuestions);
router.get("/received", requireAuth, getReceivedQuestions);
router.post(
  "/:id/answer",
  requireAuth,
  [param("id").isMongoId(), body("text").trim().notEmpty().withMessage("Answer text is required.")],
  validate,
  answerQuestion
);
router.delete("/:id", requireAuth, param("id").isMongoId(), validate, deleteQuestion);

module.exports = router;
