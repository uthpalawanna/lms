const Withdrawal = require("../models/Withdrawal");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

async function calculateBalance(instructorId) {
  const courses = await Course.find({ instructor: instructorId });
  const courseIds = courses.map((c) => c._id);

  const enrollments = await Enrollment.find({ course: { $in: courseIds } });
  const totalRevenue = enrollments.reduce((sum, e) => sum + (e.pricePaid || 0), 0);

  const paidOrApproved = await Withdrawal.find({
    instructor: instructorId,
    status: { $in: ["approved", "paid"] },
  });
  const totalWithdrawn = paidOrApproved.reduce((sum, w) => sum + w.amount, 0);

  return {
    totalRevenue,
    totalWithdrawn,
    available: totalRevenue - totalWithdrawn,
  };
}

async function getBalance(req, res) {
  try {
    const balance = await calculateBalance(req.userId);
    res.json(balance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not calculate your balance." });
  }
}

async function requestWithdrawal(req, res) {
  try {
    const { amount, method, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "A valid withdrawal amount is required." });
    }

    const { available } = await calculateBalance(req.userId);
    if (amount > available) {
      return res.status(400).json({ message: "Requested amount exceeds your available balance." });
    }

    const withdrawal = await Withdrawal.create({
      instructor: req.userId,
      amount,
      method: method || "bank",
      notes: notes || "",
    });

    res.status(201).json(withdrawal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not submit withdrawal request." });
  }
}

async function getMyWithdrawals(req, res) {
  try {
    const withdrawals = await Withdrawal.find({ instructor: req.userId }).sort({
      createdAt: -1,
    });
    res.json(withdrawals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch your withdrawals." });
  }
}

module.exports = { getBalance, requestWithdrawal, getMyWithdrawals };
