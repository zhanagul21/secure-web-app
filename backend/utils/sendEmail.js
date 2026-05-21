const nodemailer = require("nodemailer");

const smtpUser = process.env.GMAIL_USER;
const smtpPass = process.env.GMAIL_APP_PASSWORD;
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpFamily = Number.parseInt(process.env.SMTP_FAMILY || "4", 10);
const defaultFrom = process.env.MAIL_FROM || `"AuthGuard Locker" <${smtpUser}>`;
const resendApiKey = process.env.RESEND_API_KEY;
const resendApiUrl = process.env.RESEND_API_URL || "https://api.resend.com/emails";

const buildTransporter = ({ secure, port, service }) =>
  nodemailer.createTransport({
    ...(service ? { service } : { host: smtpHost, port }),
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    family: smtpFamily === 4 || smtpFamily === 6 ? smtpFamily : undefined,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    requireTLS: !secure,
    tls: {
      servername: smtpHost,
    },
  });

const transporters = [
  {
    name: "smtp-587",
    transporter: buildTransporter({
      secure: false,
      port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
    }),
  },
  {
    name: "smtp-465",
    transporter: buildTransporter({
      secure: true,
      port: Number.parseInt(process.env.SMTP_SSL_PORT || "465", 10),
    }),
  },
  {
    name: "gmail-service",
    transporter: buildTransporter({
      secure: true,
      service: "gmail",
    }),
  },
];

const canUseSmtp = Boolean(smtpUser && smtpPass);

async function verifyResendTransporter() {
  if (!resendApiKey) {
    return false;
  }

  console.log("MAILER READY: resend-api");
  return true;
}

async function sendViaResend(to, subject, html) {
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
  if (await verifyResendTransporter()) {
    return;
  }

  if (!canUseSmtp) {
    console.error("MAILER VERIFY ERROR: no RESEND_API_KEY and no SMTP credentials configured");
    return;
  }

  for (const { name, transporter } of transporters) {
    try {
      await transporter.verify();
      console.log(`MAILER READY: ${name}`);
      return;
    } catch (error) {
      console.error(`MAILER VERIFY ERROR (${name}):`, error);
    }
  }
};

const sendMail = async (to, subject, html) => {
  // Gmail SMTP алдымен, Resend тек fallback
  if (canUseSmtp) {
    let lastError;
    for (const { name, transporter } of transporters) {
      try {
        return await transporter.sendMail({
          from: defaultFrom,
          to,
          subject,
          html,
        });
      } catch (error) {
        lastError = error;
        console.error(`SEND MAIL ERROR (${name}):`, error.message);
      }
    }
    // Gmail жұмыс істемесе Resend-ке өт
    if (resendApiKey) {
      console.log("Gmail failed, trying Resend...");
      return sendViaResend(to, subject, html);
    }
    throw lastError || new Error("Email transport is unavailable");
  }

  if (resendApiKey) {
    return sendViaResend(to, subject, html);
  }

  throw new Error("Email transport is unavailable");
};

const _unusedSendMail = async (to, subject, html) => {
  if (false) {

  }
};

module.exports = {
  sendMail,
  verifyEmailTransporter,
};
