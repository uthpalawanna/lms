const Order = require("../models/Order");

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