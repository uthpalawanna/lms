const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
  },
  { _id: false }
);

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    lessons: { type: [lessonSchema], default: [] },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, default: "" },
    description: { type: String, default: "" },
    difficultyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    isPublicPreview: { type: Boolean, default: false }, 
    enableQA: { type: Boolean, default: true },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    scheduledAt: { type: Date, default: null },
    thumbnail: { type: String, default: "" },      
    introVideoUrl: { type: String, default: "" },  
    price: { type: Number, default: 0 },            
    categories: { type: [String], default: [] },
    tags: { type: [String], default: [] },

    category: { type: String, default: "Uncategorized" },

    curriculum: { type: [topicSchema], default: [] },

    requirements: { type: [String], default: [] },
    targetAudience: { type: [String], default: [] },
    materials: { type: [String], default: [] },
    faqs: { type: [faqSchema], default: [] },

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