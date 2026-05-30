const nodemailer = require("nodemailer");

const smtpUser = process.env.GMAIL_USER;
const defaultFrom = process.env.MAIL_FROM || smtpUser;
const brevoApiKey = process.env.BREVO_API_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

async function sendViaBrevo(to, subject, html) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": brevoApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "AuthGuard Locker", email: "zanaguldauletova@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || "Brevo failed: " + response.status);
  }
  return payload;
}

async function sendViaResend(to, subject, html) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || defaultFrom,
      to: [to],
      subject,
      html,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.message || "Resend failed");
    error.code = payload?.name || `HTTP_${response.status}`;
    throw error;
  }
  return payload;
}

const verifyEmailTransporter = async () => {
  if (brevoApiKey) { console.log("MAILER READY: brevo"); return; }
  if (resendApiKey) { console.log("MAILER READY: resend"); return; }
  console.error("MAILER: no transport configured");
};

const sendMail = async (to, subject, html) => {
  if (brevoApiKey) {
    return sendViaBrevo(to, subject, html);
  }
  if (resendApiKey) {
    return sendViaResend(to, subject, html);
  }
  throw new Error("Email transport is unavailable");
};

module.exports = { sendMail, verifyEmailTransporter };
