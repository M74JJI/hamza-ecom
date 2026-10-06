import { describe, expect, test } from "bun:test";
import {
  getClientIp,
  makeRateLimitKey,
  maxRetryAfter,
  normalizeRateLimitIdentifier,
} from "../lib/security/rate-limit-policy.ts";

describe("rate-limit policy", () => {
  test("normalizes identifiers without storing raw casing or surrounding whitespace", () => {
    expect(normalizeRateLimitIdentifier("  User@Example.COM  ")).toBe(
      "user@example.com",
    );
  });

  test("derives deterministic scoped HMAC keys without embedding the identifier", () => {
    const secret = "0123456789abcdef0123456789abcdef";
    const key = makeRateLimitKey("auth:signin:email", "User@Example.COM", secret);

    expect(key.startsWith("auth:signin:email:")).toBe(true);
    expect(key).not.toContain("user@example.com");
    expect(
      makeRateLimitKey("auth:signin:email", " user@example.com ", secret),
    ).toBe(key);
    expect(
      makeRateLimitKey(
        "auth:signin:email",
        "user@example.com",
        "abcdef0123456789abcdef0123456789",
      ),
    ).not.toBe(key);
  });

  test("uses the first forwarded client address and falls back safely", () => {
    const forwarded = new Request("https://example.test", {
      headers: {
        "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      },
    });
    expect(getClientIp(forwarded)).toBe("203.0.113.10");

    const realIp = new Request("https://example.test", {
      headers: {
        "x-real-ip": "198.51.100.8",
      },
    });
    expect(getClientIp(realIp)).toBe("198.51.100.8");

    expect(getClientIp(new Request("https://example.test"))).toBe("unknown");
  });

  test("returns the longest retry delay among blocked decisions", () => {
    expect(
      maxRetryAfter([
        { allowed: true, limit: 10, remaining: 2, retryAfterSeconds: 0 },
        { allowed: false, limit: 10, remaining: 0, retryAfterSeconds: 12 },
        { allowed: false, limit: 10, remaining: 0, retryAfterSeconds: 45 },
      ]),
    ).toBe(45);
  });
});
