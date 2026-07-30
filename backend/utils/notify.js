const Notification = require("../models/Notification");


async function notifyUser({ recipient, type, title, body = "", course }) {
  try {
    await Notification.create({ recipient, type, title, body, course });
  } catch (error) {
    console.error("Could not create notification:", error);
  }
}

async function notifyUsers(recipientIds, { type, title, body = "", course }) {
  if (!recipientIds || recipientIds.length === 0) return;
  try {
    await Notification.insertMany(
      recipientIds.map((recipient) => ({ recipient, type, title, body, course }))
    );
  } catch (error) {
    console.error("Could not create notifications:", error);
  }
}

module.exports = { notifyUser, notifyUsers };