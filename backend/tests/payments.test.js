const crypto = require("crypto");


const MERCHANT_ID = "test_merchant";
const MERCHANT_SECRET = "test_secret";
process.env.PAYHERE_MERCHANT_ID = MERCHANT_ID;
process.env.PAYHERE_MERCHANT_SECRET = MERCHANT_SECRET;

const request = require("supertest");
const app = require("../app");
const Order = require("../models/order");
const Enrollment = require("../models/Enrollment");
const { createUser, createCourse } = require("./helpers");

function md5(str) {
  return crypto.createHash("md5").update(str).digest("hex");
}

function signNotify({ merchant_id, order_id, amount, currency, status_code, secret }) {
  const secretHash = md5(secret).toUpperCase();
  const amt = Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, useGrouping: false });
  return md5(`${merchant_id}${order_id}${amt}${currency}${status_code}${secretHash}`).toUpperCase();
}

describe("PayHere webhook", () => {

  test("rejects a forged signature and leaves the order pending", async () => {
    const { user } = await createUser();
    const course = await createCourse();
    const order = await Order.create({
      orderId: "SHRI-TEST-1",
      student: user._id,
      course: course._id,
      amount: 1000,
      gateway: "payhere",
      paymentMethod: "PayHere",
      status: "pending",
    });

    const res = await request(app).post("/api/payments/payhere/notify").send({
      merchant_id: MERCHANT_ID,
      order_id: order.orderId,
      payhere_amount: "1000.00",
      payhere_currency: "LKR",
      status_code: "2",
      md5sig: "not-the-real-signature",
      payment_id: "fake",
    });

    expect(res.status).toBe(400);
    const updated = await Order.findById(order._id);
    expect(updated.status).toBe("pending");

    const enrollment = await Enrollment.findOne({ student: user._id, course: course._id });
    expect(enrollment).toBeNull();
  });

  test("accepts a correctly signed success notification and enrolls the student", async () => {
    const { user } = await createUser();
    const course = await createCourse();
    const order = await Order.create({
      orderId: "SHRI-TEST-2",
      student: user._id,
      course: course._id,
      amount: 1000,
      gateway: "payhere",
      paymentMethod: "PayHere",
      status: "pending",
    });

    const sig = signNotify({
      merchant_id: MERCHANT_ID,
      order_id: order.orderId,
      amount: "1000.00",
      currency: "LKR",
      status_code: "2",
      secret: MERCHANT_SECRET,
    });

    const res = await request(app).post("/api/payments/payhere/notify").send({
      merchant_id: MERCHANT_ID,
      order_id: order.orderId,
      payhere_amount: "1000.00",
      payhere_currency: "LKR",
      status_code: "2",
      md5sig: sig,
      payment_id: "real-payment-id",
    });

    expect(res.status).toBe(200);
    const updated = await Order.findById(order._id);
    expect(updated.status).toBe("paid");
    expect(updated.payherePaymentId).toBe("real-payment-id");

    const enrollment = await Enrollment.findOne({ student: user._id, course: course._id });
    expect(enrollment).not.toBeNull();
    expect(enrollment.pricePaid).toBe(1000);
  });

  test("does not create a duplicate enrollment if notify fires twice", async () => {
    const { user } = await createUser();
    const course = await createCourse();
    const order = await Order.create({
      orderId: "SHRI-TEST-3",
      student: user._id,
      course: course._id,
      amount: 500,
      gateway: "payhere",
      paymentMethod: "PayHere",
      status: "pending",
    });

    const sig = signNotify({
      merchant_id: MERCHANT_ID,
      order_id: order.orderId,
      amount: "500.00",
      currency: "LKR",
      status_code: "2",
      secret: MERCHANT_SECRET,
    });
    const payload = {
      merchant_id: MERCHANT_ID,
      order_id: order.orderId,
      payhere_amount: "500.00",
      payhere_currency: "LKR",
      status_code: "2",
      md5sig: sig,
      payment_id: "dup-test",
    };

    await request(app).post("/api/payments/payhere/notify").send(payload);
    await request(app).post("/api/payments/payhere/notify").send(payload);

    const enrollments = await Enrollment.find({ student: user._id, course: course._id });
    expect(enrollments.length).toBe(1);
  });

  test("marks the order cancelled on status_code -1", async () => {
    const { user } = await createUser();
    const course = await createCourse();
    const order = await Order.create({
      orderId: "SHRI-TEST-4",
      student: user._id,
      course: course._id,
      amount: 200,
      gateway: "payhere",
      paymentMethod: "PayHere",
      status: "pending",
    });

    const sig = signNotify({
      merchant_id: MERCHANT_ID,
      order_id: order.orderId,
      amount: "200.00",
      currency: "LKR",
      status_code: "-1",
      secret: MERCHANT_SECRET,
    });

    const res = await request(app).post("/api/payments/payhere/notify").send({
      merchant_id: MERCHANT_ID,
      order_id: order.orderId,
      payhere_amount: "200.00",
      payhere_currency: "LKR",
      status_code: "-1",
      md5sig: sig,
      payment_id: "",
    });

    expect(res.status).toBe(200);
    const updated = await Order.findById(order._id);
    expect(updated.status).toBe("cancelled");
  });

  test("404s for a notify referencing an order that doesn't exist", async () => {
    const sig = signNotify({
      merchant_id: MERCHANT_ID,
      order_id: "SHRI-DOES-NOT-EXIST",
      amount: "100.00",
      currency: "LKR",
      status_code: "2",
      secret: MERCHANT_SECRET,
    });

    const res = await request(app).post("/api/payments/payhere/notify").send({
      merchant_id: MERCHANT_ID,
      order_id: "SHRI-DOES-NOT-EXIST",
      payhere_amount: "100.00",
      payhere_currency: "LKR",
      status_code: "2",
      md5sig: sig,
      payment_id: "irrelevant",
    });

    expect(res.status).toBe(404);
  });
});