const express = require("express");
const router = express.Router();
const {
  getBalance,
  requestWithdrawal,
  getMyWithdrawals,
} = require("../controllers/withdrawalController");
const requireAuth = require("../middleware/auth");

router.get("/balance", requireAuth, getBalance);
router.get("/mine", requireAuth, getMyWithdrawals);
router.post("/", requireAuth, requestWithdrawal);

module.exports = router;
