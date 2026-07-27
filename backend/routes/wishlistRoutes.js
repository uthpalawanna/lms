const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const { getMyWishlist, addToWishlist, removeFromWishlist } = require("../controllers/WishlistController");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");

router.get("/", requireAuth, getMyWishlist);
router.post(
  "/",
  requireAuth,
  [body("course").isMongoId().withMessage("A valid course id is required.")],
  validate,
  addToWishlist
);
router.delete("/:courseId", requireAuth, param("courseId").isMongoId(), validate, removeFromWishlist);

module.exports = router;
