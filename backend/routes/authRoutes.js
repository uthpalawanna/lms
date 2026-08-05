const express = require("express");
const router = express.Router();
const { body } = require('express-validator');
const { register, login, googleLogin, getMe, updateMe, changePassword, forgotPassword, resetPassword } = require("../controllers/authController");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");

router.post(
	"/register",
	[
		body('firstName').trim().notEmpty().withMessage('First name is required'),
		body('lastName').trim().notEmpty().withMessage('Last name is required'),
		body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
		body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
		body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
	],
	validate,
	register
);

router.post(
	"/login",
	[
		body('email').trim().notEmpty().withMessage('Email or username is required'),
		body('password').notEmpty().withMessage('Password is required'),
	],
	validate,
	login
);

router.post(
	"/google",
	[body('credential').notEmpty().withMessage('Missing Google credential')],
	validate,
	googleLogin
);

router.post(
	"/forgot-password",
	[body('email').isEmail().withMessage('Valid email is required').normalizeEmail()],
	validate,
	forgotPassword
);
router.post("/reset-password/:token", [body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')], validate, resetPassword);
router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);
router.put("/change-password", requireAuth, changePassword);

module.exports = router;