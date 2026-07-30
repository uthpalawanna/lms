const Notification = require("../models/Notification");

async function getMyNotifications(req, res) {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch your notifications." });
  }
}

async function markAllRead(req, res) {
  try {
    await Notification.updateMany(
      { recipient: req.userId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update notifications." });
  }
}

module.exports = { getMyNotifications, markAllRead };