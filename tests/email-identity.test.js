import { describe, expect, test } from "bun:test";
import { normalizeEmailIdentity } from "../lib/auth/email-identity.ts";

describe("normalizeEmailIdentity", () => {
  test("trims and lowercases email identities", () => {
    expect(normalizeEmailIdentity("  User.Name+Shop@Example.COM  ")).toBe(
      "user.name+shop@example.com",
    );
  });

  test("is idempotent for canonical email identities", () => {
    const email = "customer@example.com";
    expect(normalizeEmailIdentity(normalizeEmailIdentity(email))).toBe(email);
  });
});
