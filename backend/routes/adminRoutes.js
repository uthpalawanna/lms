const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllCourses,
  deleteCourseAdmin,
  getPlatformStats,
  getAllWithdrawals,
  updateWithdrawalStatus,
} = require("../controllers/adminController");

router.use(requireAuth, requireAdmin);

router.get("/stats", getPlatformStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/courses", getAllCourses);
router.delete("/courses/:id", deleteCourseAdmin);
router.get("/withdrawals", getAllWithdrawals);
router.put("/withdrawals/:id/status", updateWithdrawalStatus);

module.exports = router;