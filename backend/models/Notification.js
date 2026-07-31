const mongoose = require("mongoose");

const NOTIFICATION_TYPES = [
  "announcement",
  "enrollment",
  "payment",
  "quiz_graded",
  "withdrawal",
  "question",
  "answer",
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;