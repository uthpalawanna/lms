const Wishlist = require("../models/Wishlist");

exports.getMyWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ student: req.userId }).populate("course");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch wishlist." });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { course } = req.body;
    const existing = await Wishlist.findOne({ student: req.userId, course });
    if (existing) return res.status(400).json({ message: "Already in wishlist." });
    
    const item = await Wishlist.create({ student: req.userId, course });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Error adding to wishlist." });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ student: req.userId, course: req.params.courseId });
    res.json({ message: "Removed." });
  } catch (error) {
    res.status(500).json({ message: "Error removing." });
  }
};