const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "Uncategorized" },
    price: { type: Number, default: 0 },
    thumbnail: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "pending", "publish", "schedule"],
      default: "draft",
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);