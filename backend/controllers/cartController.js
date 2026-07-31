const Cart = require("../models/Cart");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

async function getMyCart(req, res) {
  try {
    const cart = await Cart.findOne({ student: req.userId }).populate(
      "items.course",
      "title price thumbnail instructor"
    );
    res.json(cart?.items || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load your cart." });
  }
}

async function addToCart(req, res) {
  try {
    const { course } = req.body;
    if (!course) return res.status(400).json({ message: "Course is required." });

    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: "Course not found." });

    if (!(courseDoc.price > 0)) {
      return res.status(400).json({ message: "Free courses can be enrolled in directly — no need for the cart." });
    }

    const alreadyEnrolled = await Enrollment.findOne({ student: req.userId, course });
    if (alreadyEnrolled) {
      return res.status(409).json({ message: "You're already enrolled in this course." });
    }

    let cart = await Cart.findOne({ student: req.userId });
    if (!cart) {
      cart = await Cart.create({ student: req.userId, items: [] });
    }

    const alreadyInCart = cart.items.some((item) => item.course.toString() === course);
    if (alreadyInCart) {
      return res.status(409).json({ message: "This course is already in your cart." });
    }

    cart.items.push({ course });
    await cart.save();

    const populated = await cart.populate("items.course", "title price thumbnail instructor");
    res.status(201).json(populated.items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not add this course to your cart." });
  }
}

async function removeFromCart(req, res) {
  try {
    const { courseId } = req.params;
    const cart = await Cart.findOne({ student: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found." });

    cart.items = cart.items.filter((item) => item.course.toString() !== courseId);
    await cart.save();

    const populated = await cart.populate("items.course", "title price thumbnail instructor");
    res.json(populated.items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not remove this course from your cart." });
  }
}

module.exports = { getMyCart, addToCart, removeFromCart };