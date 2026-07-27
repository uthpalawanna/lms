const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { getMyOrders, checkout } = require("../controllers/OrderController");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");

router.get("/mine", requireAuth, getMyOrders);
router.post(
  "/checkout",
  requireAuth,
  [body("course").isMongoId().withMessage("A valid course id is required.")],
  validate,
  checkout
);

module.exports = router;
