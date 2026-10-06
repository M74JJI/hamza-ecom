import { describe, expect, test } from "bun:test";
import { getEmailConfig } from "../lib/email-config.ts";

describe("getEmailConfig", () => {
  test("uses canonical SMTP credentials and defaults to Gmail SSL", () => {
    expect(
      getEmailConfig({
        SMTP_USER: "mailer@example.com",
        SMTP_PASS: "secret",
      }),
    ).toEqual({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      user: "mailer@example.com",
      pass: "secret",
      from: "Hajzen Store <mailer@example.com>",
    });
  });

  test("prefers SMTP credentials over legacy Gmail aliases", () => {
    const config = getEmailConfig({
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: "587",
      SMTP_SECURE: "false",
      SMTP_USER: "smtp-user",
      SMTP_PASS: "smtp-pass",
      SMTP_FROM: "Store <store@example.com>",
      GMAIL_USER: "legacy-user",
      GMAIL_APP_PASS: "legacy-pass",
      AUTH_EMAIL_FROM: "legacy@example.com",
    });

    expect(config).toEqual({
      host: "smtp.example.com",
      port: 587,
      secure: false,
      user: "smtp-user",
      pass: "smtp-pass",
      from: "Store <store@example.com>",
    });
  });

  test("supports legacy Gmail credentials during migration", () => {
    const config = getEmailConfig({
      GMAIL_USER: "legacy@example.com",
      GMAIL_APP_PASS: "legacy-secret",
      AUTH_EMAIL_FROM: "auth@example.com",
    });

    expect(config.user).toBe("legacy@example.com");
    expect(config.pass).toBe("legacy-secret");
    expect(config.from).toBe("auth@example.com");
  });

  test("infers STARTTLS port behavior when port 587 is explicit", () => {
    const config = getEmailConfig({
      SMTP_USER: "mailer@example.com",
      SMTP_PASS: "secret",
      SMTP_PORT: "587",
    });

    expect(config.port).toBe(587);
    expect(config.secure).toBe(false);
  });

  test("rejects missing credentials and invalid SMTP values", () => {
    expect(() => getEmailConfig({})).toThrow("Email transport is not configured");

    expect(() =>
      getEmailConfig({
        SMTP_USER: "mailer@example.com",
        SMTP_PASS: "secret",
        SMTP_SECURE: "sometimes",
      }),
    ).toThrow("SMTP_SECURE must be true or false");

    expect(() =>
      getEmailConfig({
        SMTP_USER: "mailer@example.com",
        SMTP_PASS: "secret",
        SMTP_PORT: "70000",
      }),
    ).toThrow("SMTP_PORT must be an integer between 1 and 65535");
  });
});
