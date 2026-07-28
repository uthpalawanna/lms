const Order = require("../models/order");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");


function validatePayment(body) {
  const { paymentMethod, cardNumber, cardholderName, expiry, cvv, paypalEmail } = body;

  if (paymentMethod === "PayPal") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!paypalEmail || !emailPattern.test(paypalEmail)) {
      return { error: "A valid PayPal email is required." };
    }
    return { paymentMethod: "PayPal", paypalEmail };
  }

  const digitsOnly = (cardNumber || "").replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(digitsOnly)) {
    return { error: "Enter a valid card number." };
  }
  if (!cardholderName || !cardholderName.trim()) {
    return { error: "Cardholder name is required." };
  }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry || "")) {
    return { error: "Enter a valid expiry date (MM/YY)." };
  }
  const [mm, yy] = (expiry || "").split("/").map(Number);
  const expiryDate = new Date(2000 + yy, mm); 
  if (expiryDate < new Date()) {
    return { error: "This card has expired." };
  }
  if (!/^\d{3,4}$/.test(cvv || "")) {
    return { error: "Enter a valid CVV." };
  }

  return {
    paymentMethod: "Credit Card",
    cardLast4: digitsOnly.slice(-4),
    cardholderName: cardholderName.trim(),
  };
}

exports.checkout = async (req, res) => {
  try {
    const { course } = req.body;
    if (!course) return res.status(400).json({ message: "Course is required." });

    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: "Course not found." });

    const existing = await Enrollment.findOne({ student: req.userId, course });
    if (existing) return res.status(409).json({ message: "Already enrolled in this course." });

    const payment = validatePayment(req.body);
    if (payment.error) {
      return res.status(400).json({ message: payment.error });
    }

    const order = await Order.create({
      student: req.userId,
      course,
      amount: courseDoc.price || 0,
      paymentMethod: payment.paymentMethod,
      cardLast4: payment.cardLast4 || "",
      cardholderName: payment.cardholderName || "",
      paypalEmail: payment.paypalEmail || "",
    });

    const enrollment = await Enrollment.create({
      student: req.userId,
      course,
      pricePaid: courseDoc.price || 0,
    });

    const populated = await enrollment.populate("course", "title thumbnail category price");
    res.status(201).json({ order, enrollment: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Checkout failed." });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { range, date } = req.query;
    const query = { student: req.userId };

    
    const refDate = date ? new Date(date) : new Date();
    if (!isNaN(refDate.getTime()) && range) {
      let start, end;
      if (range === "today") {
        start = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
        end = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() + 1);
      } else if (range === "monthly") {
        start = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
        end = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1);
      } else if (range === "yearly") {
        start = new Date(refDate.getFullYear(), 0, 1);
        end = new Date(refDate.getFullYear() + 1, 0, 1);
      }
      if (start && end) {
        query.createdAt = { $gte: start, $lt: end };
      }
    }

    const orders = await Order.find(query)
      .populate("course", "title")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch orders." });
  }
};