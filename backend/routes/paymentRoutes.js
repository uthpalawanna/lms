const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { initPayHere, payHereNotify, getOrderStatus } = require("../controllers/paymentController");

router.post(
  "/payhere/init",
  requireAuth,
  [body("course").isMongoId().withMessage("A valid course id is required.")],
  validate,
  initPayHere
);
// PayHere calls this directly from their servers — there's no user logged
// in on that request, so it deliberately has no requireAuth. Trust is
// established by the md5 signature check inside the controller instead.
router.post("/payhere/notify", payHereNotify);
router.get("/payhere/status/:orderId", requireAuth, param("orderId").notEmpty(), validate, getOrderStatus);

module.exports = router;
