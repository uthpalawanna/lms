const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: (arr) => arr.length >= 2,
    },
    correctOptionIndex: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: {
      type: [questionSchema],
      required: true,
      validate: (arr) => arr.length >= 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);