const User = require("../models/User");

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not verify admin access." });
  }
}

module.exports = requireAdmin;