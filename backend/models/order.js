const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: "Credit Card" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);