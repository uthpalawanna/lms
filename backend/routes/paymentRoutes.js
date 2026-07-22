const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const { initPayHere, payHereNotify, getOrderStatus } = require("../controllers/paymentController");

router.post("/payhere/init", requireAuth, initPayHere);
// PayHere calls this directly from their servers — there's no user logged
// in on that request, so it deliberately has no requireAuth. Trust is
// established by the md5 signature check inside the controller instead.
router.post("/payhere/notify", payHereNotify);
router.get("/payhere/status/:orderId", requireAuth, getOrderStatus);

module.exports = router;
