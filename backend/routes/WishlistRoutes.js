const express = require("express");
const router = express.Router();
const { getMyWishlist, addToWishlist, removeFromWishlist } = require("../controllers/wishlistController");
const requireAuth = require("../middleware/auth");

router.get("/", requireAuth, getMyWishlist);
router.post("/", requireAuth, addToWishlist);
router.delete("/:courseId", requireAuth, removeFromWishlist);

module.exports = router;