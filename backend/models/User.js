const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    role: { type: String, enum: ["student", "instructor"], default: "student" },
    phone: { type: String, default: "" },
    skill: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("User", userSchema);