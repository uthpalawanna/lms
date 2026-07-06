const express = require("express");
const router = express.Router();
const { getMyOrders } = require("../controllers/OrderController");
const requireAuth = require("../middleware/auth");

router.get("/mine", requireAuth, getMyOrders);

module.exports = router;
