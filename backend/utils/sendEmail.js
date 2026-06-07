const defaultFrom = process.env.MAIL_FROM || process.env.GMAIL_USER;
const mailjetApiKey = process.env.MAILJET_API_KEY;
const mailjetSecretKey = process.env.MAILJET_SECRET_KEY;
const mailjetFromEmail =
  process.env.MAILJET_FROM_EMAIL ||
  process.env.MAIL_FROM ||
  "zanaguldauletova@gmail.com";
const mailjetFromName = process.env.MAILJET_FROM_NAME || "AuthGuard";
const brevoApiKey = process.env.BREVO_API_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

const htmlToText = (html) =>
  String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

async function sendViaMailjet(to, subject, html) {
  const credentials = Buffer.from(`${mailjetApiKey}:${mailjetSecretKey}`).toString("base64");
  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: mailjetFromEmail, Name: mailjetFromName },
          To: [{ Email: to }],
          Subject: subject,
          TextPart: htmlToText(html),
          HTMLPart: html,
        },
      ],
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.Messages?.[0]?.Status === "error") {
    const mailjetError =
      payload?.Messages?.[0]?.Errors?.[0] ||
      payload?.ErrorMessage ||
      payload?.ErrorInfo ||
      payload;
    const error = new Error(
      mailjetError?.ErrorMessage ||
        mailjetError?.message ||
        `Mailjet failed with HTTP ${response.status}`
    );
    error.code = mailjetError?.ErrorCode || `MAILJET_${response.status}`;
    error.details = mailjetError;
    throw error;
  }
  console.log(
    "MAILJET SENT:",
    payload?.Messages?.[0]?.To?.[0]?.MessageUUID || "accepted",
    "to",
    to
  );
  return payload;
}

async function sendViaBrevo(to, subject, html) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": brevoApiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "AuthGuard Locker", email: process.env.BREVO_SENDER_EMAIL || "zanaguldauletova@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || "Brevo failed");
  return payload;
}

async function sendViaResend(to, subject, html) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL || defaultFrom, to: [to], subject, html }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) { const e = new Error(payload?.message || "Resend failed"); e.code = payload?.name; throw e; }
  return payload;
}

const verifyEmailTransporter = async () => {
  if (mailjetApiKey && mailjetSecretKey) { console.log("MAILER READY: mailjet"); return; }
  if (brevoApiKey) { console.log("MAILER READY: brevo"); return; }
  if (resendApiKey) { console.log("MAILER READY: resend"); return; }
  console.error("MAILER: no transport configured");
};

const sendMail = async (to, subject, html) => {
  if (mailjetApiKey && mailjetSecretKey) return sendViaMailjet(to, subject, html);
  if (brevoApiKey) return sendViaBrevo(to, subject, html);
  if (resendApiKey) return sendViaResend(to, subject, html);
  throw new Error("Email transport is unavailable");
};

module.exports = { sendMail, verifyEmailTransporter };
