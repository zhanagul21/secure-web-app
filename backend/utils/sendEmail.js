const nodemailer = require("nodemailer");

const smtpUser = process.env.GMAIL_USER;
const defaultFrom = process.env.MAIL_FROM || smtpUser;

// Gmail OAuth2
const gmailClientId = process.env.GMAIL_API_CLIENT_ID;
const gmailClientSecret = process.env.GMAIL_API_CLIENT_SECRET;
const gmailRefreshToken = process.env.GMAIL_API_REFRESH_TOKEN;
const canUseOAuth2 = Boolean(gmailClientId && gmailClientSecret && gmailRefreshToken && smtpUser);

// Brevo
const brevoApiKey = process.env.BREVO_API_KEY;

// Resend
const resendApiKey = process.env.RESEND_API_KEY;

async function sendViaOAuth2(to, subject, html) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: smtpUser,
      clientId: gmailClientId,
      clientSecret: gmailClientSecret,
      refreshToken: gmailRefreshToken,
    },
  });
  return transporter.sendMail({ from: defaultFrom, to, subject, html });
}

async function sendViaBrevo(to, subject, html) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": brevoApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "AuthGuard Locker", email: defaultFrom },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.message || "Brevo failed");
    error.code = `HTTP_${response.status}`;
    throw error;
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
  if (canUseOAuth2) { console.log("MAILER READY: gmail-oauth2"); return; }
  if (brevoApiKey) { console.log("MAILER READY: brevo"); return; }
  if (resendApiKey) { console.log("MAILER READY: resend"); return; }
  console.error("MAILER: no transport configured");
};

const sendMail = async (to, subject, html) => {
  // 1. Gmail OAuth2 — ең сенімді
  if (canUseOAuth2) {
    try {
      return await sendViaOAuth2(to, subject, html);
    } catch (err) {
      console.error("OAUTH2 ERROR:", err.message);
    }
  }

  // 2. Brevo
  if (brevoApiKey) {
    try {
      return await sendViaBrevo(to, subject, html);
    } catch (err) {
      console.error("BREVO ERROR:", err.message);
    }
  }

  // 3. Resend
  if (resendApiKey) {
    return sendViaResend(to, subject, html);
  }

  throw new Error("Email transport is unavailable");
};

module.exports = { sendMail, verifyEmailTransporter };
