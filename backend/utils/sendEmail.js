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

const verifySmtpTransporter = async () => {
  for (const { name, transporter } of transporters) {
    try {
      await transporter.verify();
      console.log(`MAILER READY: ${name}`);
      return true;
    } catch (error) {
      console.error(`MAILER VERIFY ERROR (${name}):`, error);
    }
  }

  return false;
};

const verifyEmailTransporter = async () => {
  const hasResend = await verifyResendTransporter();

  if (canUseSmtp) {
    const smtpReady = await verifySmtpTransporter();

    if (smtpReady) {
      return;
    }
  }

  if (!hasResend && !canUseSmtp) {
    console.error("MAILER VERIFY ERROR: no RESEND_API_KEY and no SMTP credentials configured");
  }
};

const sendViaSmtp = async (to, subject, html) => {
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
      console.error(`SEND MAIL ERROR (${name}):`, error);
    }
  }

  throw lastError || new Error("Email transport is unavailable");
};

const sendMail = async (to, subject, html) => {
  let resendError;

  if (resendApiKey) {
    try {
      return await sendViaResend(to, subject, html);
    } catch (error) {
      resendError = error;
      console.error("SEND MAIL ERROR (resend-api):", error);
    }
  }

  if (!canUseSmtp) {
    throw resendError || new Error("Email transport is unavailable");
  }

  return sendViaSmtp(to, subject, html);
};

module.exports = {
  sendMail,
  verifyEmailTransporter,
};
