const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["Credit Card", "PayPal"], default: "Credit Card" },
  // Only the non-sensitive bits of payment info are ever stored. Full card
  // numbers/CVVs are never sent to or persisted by this server.
  cardLast4: { type: String, default: "" },
  cardholderName: { type: String, default: "" },
  paypalEmail: { type: String, default: "" },
  status: { type: String, enum: ["paid"], default: "paid" },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);