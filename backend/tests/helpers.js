// Shared helpers for spinning up test users/tokens without going through
// the HTTP registration flow every time.
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

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

module.exports = { createUser };
