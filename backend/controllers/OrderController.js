const Order = require("../models/order");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");


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
      .populate("courses.course", "title")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch orders." });
  }
};