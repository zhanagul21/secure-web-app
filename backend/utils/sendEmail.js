const nodemailer = require("nodemailer");
const dns = require("dns");

dns.setDefaultResultOrder?.("ipv4first");

const smtpUser = process.env.GMAIL_USER;
const smtpPass = process.env.GMAIL_APP_PASSWORD;
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpFamily = Number.parseInt(process.env.SMTP_FAMILY || "4", 10);
const defaultFrom = process.env.MAIL_FROM || `"AuthGuard Locker" <${smtpUser}>`;
const compactSecret = (value) => value?.replace(/\s/g, "");
const gmailApiClientId = compactSecret(process.env.GMAIL_API_CLIENT_ID);
const gmailApiClientSecret = compactSecret(process.env.GMAIL_API_CLIENT_SECRET);
const gmailApiRefreshToken = compactSecret(process.env.GMAIL_API_REFRESH_TOKEN);
const resendApiKey = process.env.RESEND_API_KEY;
const resendApiUrl = process.env.RESEND_API_URL || "https://api.resend.com/emails";
const resendFrom =
  process.env.RESEND_FROM_EMAIL ||
  process.env.MAIL_FROM ||
  "AuthGuard Locker <onboarding@resend.dev>";
const smtpLookup =
  smtpFamily === 4 || smtpFamily === 6
    ? (hostname, options, callback) => {
        const lookupOptions =
          typeof options === "object" && options !== null ? options : {};
        dns.lookup(hostname, { ...lookupOptions, family: smtpFamily }, callback);
      }
    : undefined;

const resolveSmtpHost = async () => {
  if (smtpFamily !== 4) {
    return smtpHost;
  }

  try {
    const addresses = await dns.promises.resolve4(smtpHost);
    return addresses[0] || smtpHost;
  } catch (error) {
    console.error("SMTP DNS IPV4 RESOLVE ERROR:", error);
    return smtpHost;
  }
};

const buildTransporter = ({ host, secure, port }) =>
  nodemailer.createTransport({
    host,
    port,
    lookup: smtpLookup,
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

const transporterConfigs = [
  {
    name: "smtp-465",
    secure: true,
    port: Number.parseInt(process.env.SMTP_SSL_PORT || "465", 10),
  },
  {
    name: "smtp-587",
    secure: false,
    port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
  },
];

const canUseSmtp = Boolean(smtpUser && smtpPass);
const canUseGmailApi = Boolean(
  smtpUser &&
    gmailApiClientId &&
    gmailApiClientSecret &&
    gmailApiRefreshToken
);

const describeSecret = (value) => {
  if (!value) {
    return "missing";
  }

  return `len=${value.length}, start=${value.slice(0, 8)}, end=${value.slice(-24)}`;
};

const encodeBase64Url = (value) =>
  Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const buildMimeMessage = ({ to, subject, html }) => {
  const from = process.env.MAIL_FROM || `AuthGuard Locker <${smtpUser}>`;

  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
  ].join("\r\n");
};

async function getGmailApiAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: gmailApiClientId,
      client_secret: gmailApiClientSecret,
      refresh_token: gmailApiRefreshToken,
      grant_type: "refresh_token",
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.access_token) {
    const error = new Error(payload?.error_description || payload?.error || "Gmail API token request failed");
    error.code = payload?.error || `HTTP_${response.status}`;
    throw error;
  }

  return payload.access_token;
}

async function sendViaGmailApi(to, subject, html) {
  const accessToken = await getGmailApiAccessToken();
  const raw = encodeBase64Url(buildMimeMessage({ to, subject, html }));
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      "Gmail API send request failed";
    const error = new Error(message);
    error.code = payload?.error?.status || `HTTP_${response.status}`;
    throw error;
  }

  return payload;
}

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
      from: resendFrom,
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
  const host = await resolveSmtpHost();

  for (const { name, secure, port } of transporterConfigs) {
    const transporter = buildTransporter({ host, secure, port });

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
  if (canUseGmailApi) {
    console.log("MAILER READY: gmail-api", {
      clientId: describeSecret(gmailApiClientId),
      clientSecret: describeSecret(gmailApiClientSecret),
      refreshToken: describeSecret(gmailApiRefreshToken),
      user: smtpUser,
    });
    return;
  }

  if (canUseSmtp) {
    const smtpReady = await verifySmtpTransporter();

    if (smtpReady) {
      return;
    }
  }

  const hasResend = await verifyResendTransporter();

  if (hasResend) {
    return;
  }

  if (!hasResend && !canUseSmtp) {
    console.error("MAILER VERIFY ERROR: no RESEND_API_KEY and no SMTP credentials configured");
  }
};

const sendViaSmtp = async (to, subject, html) => {
  let lastError;
  const host = await resolveSmtpHost();

  for (const { name, secure, port } of transporterConfigs) {
    const transporter = buildTransporter({ host, secure, port });

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
  let gmailApiError;
  let smtpError;

  if (canUseGmailApi) {
    try {
      return await sendViaGmailApi(to, subject, html);
    } catch (error) {
      gmailApiError = error;
      console.error("SEND MAIL ERROR (gmail-api):", error);
    }
  }

  if (canUseSmtp) {
    try {
      return await sendViaSmtp(to, subject, html);
    } catch (error) {
      smtpError = error;
      console.error("SEND MAIL ERROR (gmail-smtp):", error);
    }
  }

  if (resendApiKey) {
    try {
      return await sendViaResend(to, subject, html);
    } catch (error) {
      if (gmailApiError) {
        error.message = `${error.message}; Gmail API failed: ${gmailApiError.message}`;
      }

      if (smtpError) {
        error.message = `${error.message}; Gmail SMTP fallback failed: ${smtpError.message}`;
      }

      throw error;
    }
  }

  throw gmailApiError || smtpError || new Error("Email transport is unavailable");
};

module.exports = {
  sendMail,
  verifyEmailTransporter,
};
