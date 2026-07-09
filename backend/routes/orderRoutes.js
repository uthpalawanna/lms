const express = require("express");
const router = express.Router();
const { getMyOrders, checkout } = require("../controllers/OrderController");
const requireAuth = require("../middleware/auth");

router.get("/mine", requireAuth, getMyOrders);
router.post("/checkout", requireAuth, checkout);

module.exports = router;
