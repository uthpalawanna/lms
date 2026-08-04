const crypto = require("crypto");
const Order = require("../models/order");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const Cart = require("../models/Cart");
const { notifyUser } = require("../utils/notify");

const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;
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

function generateHash(orderId, amount) {
  const secretHash = md5(MERCHANT_SECRET).toUpperCase();
  return md5(`${MERCHANT_ID}${orderId}${formatAmount(amount)}LKR${secretHash}`).toUpperCase();
}

function buildPayHereCustomerFields(user) {
  const billing = user?.billingAddress || {};
  const [profileFirst, ...profileRest] = (user?.username || "Student").split(" ");

  return {
    first_name: billing.firstName || user?.firstName || profileFirst || "Student",
    last_name: billing.lastName || user?.lastName || profileRest.join(" ") || "-",
    email: billing.email || user?.email || "",
    phone: billing.phone || user?.phone || "0770000000",
    address: billing.address || "N/A",
    city: billing.city || "N/A",
    country: billing.country || "Sri Lanka",
  };
}

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

    const customer = buildPayHereCustomerFields(user);

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
      ...customer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not start payment." });
  }
};


exports.initCartCheckout = async (req, res) => {
  try {
    if (!MERCHANT_ID || !MERCHANT_SECRET) {
      return res.status(500).json({ message: "Payment gateway isn't configured yet." });
    }

    const cart = await Cart.findOne({ student: req.userId }).populate("items.course", "title price");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const alreadyEnrolled = await Enrollment.find({ student: req.userId }).select("course");
    const enrolledIds = new Set(alreadyEnrolled.map((e) => e.course.toString()));

    const payableItems = cart.items.filter(
      (item) => item.course && item.course.price > 0 && !enrolledIds.has(item.course._id.toString())
    );

    if (payableItems.length === 0) {
      return res.status(400).json({ message: "Nothing left in your cart to check out — you may already be enrolled in these." });
    }

    const courses = payableItems.map((item) => ({
      course: item.course._id,
      price: Number(item.course.price),
    }));
    const amount = courses.reduce((sum, c) => sum + c.price, 0);
    const titles = payableItems.map((item) => item.course.title).join(", ");

    const user = await User.findById(req.userId);
    const orderId = `SHRI-CART-${Date.now()}-${req.userId.toString().slice(-6)}`;

    await Order.create({
      orderId,
      student: req.userId,
      courses,
      amount,
      gateway: "payhere",
      paymentMethod: "PayHere",
      status: "pending",
    });

    const customer = buildPayHereCustomerFields(user);

    res.json({
      sandbox: process.env.PAYHERE_MODE !== "live",
      merchant_id: MERCHANT_ID,
      return_url: `${FRONTEND_URL}/payment/success`,
      cancel_url: `${FRONTEND_URL}/payment/cancelled`,
      notify_url: `${APP_BASE_URL}/api/payments/payhere/notify`,
      order_id: orderId,
      items: titles,
      amount: amount.toFixed(2),
      currency: "LKR",
      hash: generateHash(orderId, amount),
      ...customer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not start checkout." });
  }
};

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
    if (code === "2") {
      order.status = "paid";
      order.payherePaymentId = payment_id || "";
      await order.save();

      if (order.courses && order.courses.length > 0) {
        for (const item of order.courses) {
          const already = await Enrollment.findOne({ student: order.student, course: item.course });
          if (!already) {
            await Enrollment.create({
              student: order.student,
              course: item.course,
              pricePaid: item.price,
            });

            const courseDoc = await Course.findById(item.course).select("title");
            await notifyUser({
              recipient: order.student,
              type: "payment",
              title: "Enrollment confirmed",
              body: `You're now enrolled in ${courseDoc?.title || "the course"}.`,
              course: item.course,
            });
          }
        }

        const paidIds = order.courses.map((item) => item.course.toString());
        await Cart.updateOne(
          { student: order.student },
          { $pull: { items: { course: { $in: paidIds } } } }
        );
      } else if (order.course) {
        const already = await Enrollment.findOne({ student: order.student, course: order.course });
        if (!already) {
          await Enrollment.create({
            student: order.student,
            course: order.course,
            pricePaid: order.amount,
          });

          const courseDoc = await Course.findById(order.course).select("title");
          await notifyUser({
            recipient: order.student,
            type: "payment",
            title: "Enrollment confirmed",
            body: `You're now enrolled in ${courseDoc?.title || "the course"}.`,
            course: order.course,
          });
        }
      }
    } else if (code === "-1") {
      order.status = "cancelled";
      await order.save();
    } else if (code === "0") {
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

exports.getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, student: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ status: order.status });
  } catch (error) {
    res.status(500).json({ message: "Could not check order status." });
  }
};