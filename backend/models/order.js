const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  // Our own reference sent to PayHere as order_id. Unique + sparse so old
  // simulated orders (which never had one) don't collide on null.
  orderId: { type: String, unique: true, sparse: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // Single-course direct purchase (existing "Enroll" flow on Browse Courses / Course Detail).
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  // Multi-course cart checkout. Each course's price is snapshotted at
  // checkout time so later price changes don't affect what was actually
  // paid, and so per-course pricePaid on Enrollment stays accurate.
  courses: [
    {
      course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      price: { type: Number },
    },
  ],
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