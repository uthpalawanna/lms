const RESEND_API_URL = "https://api.resend.com/emails";

async function sendPasswordResetEmail(to, resetUrl) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Email service is not configured (RESEND_API_KEY is missing from .env).");
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "SHRI LMS <onboarding@resend.dev>",
      to,
      subject: "Reset your SHRI LMS password",
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
      `,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Resend API error (${res.status}): ${errorBody || res.statusText}`);
  }
}

module.exports = { sendPasswordResetEmail };