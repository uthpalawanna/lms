const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn(
      "GMAIL_USER / GMAIL_APP_PASSWORD are not set. Password reset emails will not be sent."
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  return transporter;
}

async function sendPasswordResetEmail(to, resetUrl) {
  const activeTransporter = getTransporter();
  if (!activeTransporter) {
    throw new Error("Email service is not configured.");
  }

  await activeTransporter.sendMail({
    from: `"SHRI LMS" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Reset your SHRI LMS password",
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
