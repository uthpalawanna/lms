const crypto = require("crypto");
const Order = require("../models/order");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");

const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;
// Public URL PayHere can reach from the internet to POST the notify webhook.
// On localhost this must be an ngrok/tunnel URL, not http://localhost:5000.
const APP_BASE_URL = process.env.APP_BASE_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

function md5(str) {
  return crypto.createHash("md5").update(str).digest("hex");
}

function formatAmount(amount) {
  return Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    useGrouping: false,
  });
}

// PayHere's required hash so their popup can be trusted without ever
// exposing MERCHANT_SECRET to the browser.
function generateHash(orderId, amount) {
  const secretHash = md5(MERCHANT_SECRET).toUpperCase();
  return md5(`${MERCHANT_ID}${orderId}${formatAmount(amount)}LKR${secretHash}`).toUpperCase();
}

// Called by the browser (authenticated) to start a PayHere checkout.
// Creates a "pending" order and hands back everything payhere.startPayment() needs.
exports.initPayHere = async (req, res) => {
  try {
    if (!MERCHANT_ID || !MERCHANT_SECRET) {
      return res.status(500).json({ message: "Payment gateway isn't configured yet." });
    }

    const { course } = req.body;
    if (!course) return res.status(400).json({ message: "Course is required." });

    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: "Course not found." });

    const existing = await Enrollment.findOne({ student: req.userId, course });
    if (existing) return res.status(409).json({ message: "Already enrolled in this course." });

    const user = await User.findById(req.userId);
    const amount = Number(courseDoc.price || 0);
    if (amount <= 0) {
      return res.status(400).json({ message: "This course is free — use the free-enroll endpoint instead." });
    }

    const orderId = `SHRI-${Date.now()}-${req.userId.toString().slice(-6)}`;

    await Order.create({
      orderId,
      student: req.userId,
      course,
      amount,
      gateway: "payhere",
      paymentMethod: "PayHere",
      status: "pending",
    });

    const [firstName, ...rest] = (user?.username || "Student").split(" ");

    res.json({
      sandbox: process.env.PAYHERE_MODE !== "live",
      merchant_id: MERCHANT_ID,
      return_url: `${FRONTEND_URL}/payment/success`,
      cancel_url: `${FRONTEND_URL}/payment/cancelled`,
      notify_url: `${APP_BASE_URL}/api/payments/payhere/notify`,
      order_id: orderId,
      items: courseDoc.title,
      amount: amount.toFixed(2),
      currency: "LKR",
      hash: generateHash(orderId, amount),
      first_name: firstName || "Student",
      last_name: rest.join(" ") || "-",
      email: user?.email || "",
      phone: user?.phone || "0770000000",
      address: "N/A",
      city: "N/A",
      country: "Sri Lanka",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not start payment." });
  }
};

// Called SERVER-TO-SERVER by PayHere, not by the browser. This is the only
// place an order/enrollment should ever be marked paid — the browser-side
// onCompleted callback is for UX only and must never grant access by itself.
exports.payHereNotify = async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      payment_id,
    } = req.body;

    const secretHash = md5(MERCHANT_SECRET).toUpperCase();
    const expectedSig = md5(
      `${merchant_id}${order_id}${formatAmount(payhere_amount)}${payhere_currency}${status_code}${secretHash}`
    ).toUpperCase();

    if (expectedSig !== md5sig) {
      console.error("PayHere notify: signature mismatch for order", order_id);
      return res.status(400).send("Invalid signature");
    }

    const order = await Order.findOne({ orderId: order_id });
    if (!order) return res.status(404).send("Order not found");

    const code = String(status_code);
    // 2 = success, 0 = pending, -1 = cancelled, -2 = failed, -3 = chargedback
    if (code === "2") {
      order.status = "paid";
      order.payherePaymentId = payment_id || "";
      await order.save();

      const already = await Enrollment.findOne({ student: order.student, course: order.course });
      if (!already) {
        await Enrollment.create({
          student: order.student,
          course: order.course,
          pricePaid: order.amount,
        });
      }
    } else if (code === "-1") {
      order.status = "cancelled";
      await order.save();
    } else if (code === "0") {
      // still pending, nothing to do yet
    } else {
      order.status = "failed";
      await order.save();
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
};

// Polled by the frontend after payhere.onCompleted fires, to confirm the
// notify webhook has actually landed before unlocking the course in the UI.
exports.getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, student: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ status: order.status });
  } catch (error) {
    res.status(500).json({ message: "Could not check order status." });
  }
};
