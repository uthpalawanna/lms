const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { getMyCart, addToCart, removeFromCart } = require("../controllers/cartController");

router.get("/mine", requireAuth, getMyCart);

router.post(
  "/",
  requireAuth,
  [body("course").isMongoId().withMessage("A valid course id is required.")],
  validate,
  addToCart
);

router.delete(
  "/:courseId",
  requireAuth,
  [param("courseId").isMongoId().withMessage("A valid course id is required.")],
  validate,
  removeFromCart
);

module.exports = router;