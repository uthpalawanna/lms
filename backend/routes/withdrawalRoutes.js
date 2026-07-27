const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  getBalance,
  requestWithdrawal,
  getMyWithdrawals,
} = require("../controllers/withdrawalController");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");

router.get("/balance", requireAuth, getBalance);
router.get("/mine", requireAuth, getMyWithdrawals);
router.post(
  "/",
  requireAuth,
  [
    body("amount").isFloat({ gt: 0 }).withMessage("A valid withdrawal amount is required."),
    body("method").optional().isIn(["bank", "paypal", "other"]).withMessage("Invalid withdrawal method."),
    body("notes").optional().isString().isLength({ max: 1000 }),
  ],
  validate,
  requestWithdrawal
);

module.exports = router;
