type EmailEnv = Record<string, string | undefined>;

export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

function firstNonEmpty(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean);
}

function parseSecure(value: string | undefined) {
  if (value === undefined || value.trim() === "") return undefined;

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;

  throw new Error("SMTP_SECURE must be true or false");
}

function parsePort(value: string | undefined) {
  if (value === undefined || value.trim() === "") return undefined;

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be an integer between 1 and 65535");
  }

  return port;
}

export function getEmailConfig(env: EmailEnv = process.env): EmailConfig {
  const user = firstNonEmpty(env.SMTP_USER, env.GMAIL_USER);
  const pass = firstNonEmpty(env.SMTP_PASS, env.GMAIL_APP_PASS);

  if (!user || !pass) {
    throw new Error(
      "Email transport is not configured. Set SMTP_USER/SMTP_PASS (or legacy GMAIL_USER/GMAIL_APP_PASS).",
    );
  }

  const host = firstNonEmpty(env.SMTP_HOST) ?? "smtp.gmail.com";
  const explicitSecure = parseSecure(env.SMTP_SECURE);
  const explicitPort = parsePort(env.SMTP_PORT);

  const secure =
    explicitSecure ??
    (explicitPort !== undefined ? explicitPort === 465 : true);

  const port = explicitPort ?? (secure ? 465 : 587);
  const from =
    firstNonEmpty(env.SMTP_FROM, env.AUTH_EMAIL_FROM) ??
    `HAMZA <${user}>`;

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
  };
}
