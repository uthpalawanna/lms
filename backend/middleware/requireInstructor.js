const User = require("../models/User");

async function requireInstructor(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      return res.status(403).json({ message: "Instructor access required." });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not verify instructor access." });
  }
}

module.exports = requireInstructor;
