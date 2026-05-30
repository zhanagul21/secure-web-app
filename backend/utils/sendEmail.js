const nodemailer = require("nodemailer");

const smtpUser = process.env.GMAIL_USER;
const smtpPass = process.env.GMAIL_APP_PASSWORD;
const defaultFrom = process.env.MAIL_FROM || `"AuthGuard Locker" <${smtpUser}>`;
const resendApiKey = process.env.RESEND_API_KEY;
const brevoApiKey = process.env.BREVO_API_KEY;

// Brevo (SendinBlue) арқылы жіберу - кез-келген emailге жібереді
async function sendViaBrevo(to, subject, html) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": brevoApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "AuthGuard Locker", email: process.env.MAIL_FROM || "zanaguldauletova@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.message || "Brevo email request failed");
    error.code = `HTTP_${response.status}`;
    throw error;
  }

  return payload;
}

async function sendViaResend(to, subject, html) {
  const resendApiUrl = process.env.RESEND_API_URL || "https://api.resend.com/emails";
  const response = await fetch(resendApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || process.env.RESEND_FROM_EMAIL || smtpUser,
      to: [to],
      subject,
      html,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error || "Resend email request failed");
    error.code = payload?.name || `HTTP_${response.status}`;
    throw error;
  }
  return payload;
}

const verifyEmailTransporter = async () => {
  if (brevoApiKey) { console.log("MAILER READY: brevo"); return; }
  if (resendApiKey) { console.log("MAILER READY: resend-api"); return; }
  console.error("MAILER VERIFY ERROR: no email transport configured");
};

const sendMail = async (to, subject, html) => {
  // 1. Brevo — кез-келген emailге жібереді
  if (brevoApiKey) {
    return sendViaBrevo(to, subject, html);
  }

  // 2. Resend fallback
  if (resendApiKey) {
    return sendViaResend(to, subject, html);
  }

  throw new Error("Email transport is unavailable");
};

module.exports = { sendMail, verifyEmailTransporter };
