const Order = require("../models/order");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

exports.checkout = async (req, res) => {
  try {
    const { course, paymentMethod } = req.body;
    if (!course) return res.status(400).json({ message: "Course is required." });

    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: "Course not found." });

    const existing = await Enrollment.findOne({ student: req.userId, course });
    if (existing) return res.status(409).json({ message: "Already enrolled in this course." });

    const order = await Order.create({
      student: req.userId,
      course,
      amount: courseDoc.price || 0,
      paymentMethod: paymentMethod || "Credit Card",
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
    const { filterDate } = req.query; 
    const orders = await Order.find({ student: req.userId })
      .populate("course", "title")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch orders." });
  }
};