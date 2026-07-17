const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Withdrawal = require("../models/Withdrawal");
const Review = require("../models/Review");
const Wishlist = require("../models/Wishlist");
const QuizAttempt = require("../models/QuizAttempt");
const Question = require("../models/Question");
const { cascadeDeleteCourse } = require("./courseController");

async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch users." });
  }
}

async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    if (!["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    const requester = await User.findById(req.userId);
    if (req.params.id === req.userId && requester?.role === "admin" && role !== "admin") {
      return res.status(400).json({ message: "You can't remove your own admin access." });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    user.role = role;
    await user.save();
    const { password, ...safeUser } = user.toObject();
    res.json(safeUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update the user's role." });
  }
}

async function deleteUser(req, res) {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: "You can't delete your own account." });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.role === "instructor" || user.role === "admin") {
      const ownedCourses = await Course.find({ instructor: user._id }).select("_id");
      for (const c of ownedCourses) {
        await cascadeDeleteCourse(c._id);
      }
      await Course.deleteMany({ instructor: user._id });
      await Withdrawal.deleteMany({ instructor: user._id });
    }

    await Enrollment.deleteMany({ student: user._id });
    await Review.deleteMany({ student: user._id });
    await Wishlist.deleteMany({ student: user._id });
    await QuizAttempt.deleteMany({ student: user._id });
    await Question.deleteMany({ student: user._id });

    await user.deleteOne();
    res.json({ message: "User deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete the user." });
  }
}

async function getAllCourses(req, res) {
  try {
    const courses = await Course.find()
      .populate("instructor", "firstName lastName username email")
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch courses." });
  }
}

async function deleteCourseAdmin(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found." });
    await cascadeDeleteCourse(course._id);
    await course.deleteOne();
    res.json({ message: "Course deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete the course." });
  }
}

async function getPlatformStats(req, res) {
  try {
    const [totalUsers, totalInstructors, totalCourses, totalEnrollments] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ["instructor", "admin"] } }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
    ]);
    const publishedCourses = await Course.countDocuments({ status: "publish" });
    res.json({ totalUsers, totalInstructors, totalCourses, publishedCourses, totalEnrollments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch platform stats." });
  }
}

async function getAllWithdrawals(req, res) {
  try {
    const withdrawals = await Withdrawal.find()
      .populate("instructor", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch withdrawals." });
  }
}

async function updateWithdrawalStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected", "paid"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found." });
    withdrawal.status = status;
    await withdrawal.save();
    res.json(withdrawal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update withdrawal status." });
  }
}

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllCourses,
  deleteCourseAdmin,
  getPlatformStats,
  getAllWithdrawals,
  updateWithdrawalStatus,
};