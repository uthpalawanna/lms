const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  // Our own reference sent to PayHere as order_id. Unique + sparse so old
  // simulated orders (which never had one) don't collide on null.
  orderId: { type: String, unique: true, sparse: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  amount: { type: Number, required: true },
  gateway: { type: String, enum: ["payhere", "simulated"], default: "simulated" },
  payherePaymentId: { type: String, default: "" },
  paymentMethod: { type: String, enum: ["Credit Card", "PayPal", "PayHere"], default: "Credit Card" },
  // Only the non-sensitive bits of card payment info are ever stored, for
  // the legacy simulated flow. Full card numbers/CVVs are never persisted.
  cardLast4: { type: String, default: "" },
  cardholderName: { type: String, default: "" },
  paypalEmail: { type: String, default: "" },
  // pending -> just created, waiting for PayHere's server-to-server notify.
  // paid -> notify confirmed status_code 2 and signature verified.
  status: { type: String, enum: ["pending", "paid", "cancelled", "failed"], default: "paid" },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
