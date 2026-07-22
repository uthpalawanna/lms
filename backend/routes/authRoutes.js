const express = require("express");
const router = express.Router();
const { register, login, getMe, updateMe, changePassword, forgotPassword, resetPassword } = require("../controllers/authController");
const requireAuth = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);
router.put("/change-password", requireAuth, changePassword);

module.exports = router;