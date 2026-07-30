const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Course = require("../models/Course");

async function createUser({ role = "student", email, username } = {}) {
  const suffix = Math.random().toString(36).slice(2, 8);
  const password = await bcrypt.hash("Password123!", 10);
  const user = await User.create({
    firstName: "Test",
    lastName: "User",
    username: username || `user_${suffix}`,
    email: email || `user_${suffix}@example.com`,
    password,
    role,
  });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return { user, token };
}

async function createCourse({ instructor, price = 1000, title } = {}) {
  const owner = instructor || (await createUser({ role: "instructor" })).user._id;
  const suffix = Math.random().toString(36).slice(2, 8);
  const course = await Course.create({
    title: title || `Test Course ${suffix}`,
    instructor: owner,
    price,
    status: "publish",
  });
  return course;
}

module.exports = { createUser, createCourse };