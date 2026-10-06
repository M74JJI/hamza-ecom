import { describe, expect, test } from "bun:test";
import {
  getPersistedSessionTokenCandidates,
  hashSessionToken,
  isLegacyPlaintextSessionToken,
} from "../lib/session-token.ts";

describe("session token persistence", () => {
  test("stores a deterministic SHA-256 digest instead of the bearer token", () => {
    const raw = "0123456789abcdef".repeat(3);
    const digest = hashSessionToken(raw);

    expect(digest).toHaveLength(64);
    expect(digest).not.toBe(raw);
    expect(hashSessionToken(raw)).toBe(digest);
  });

  test("accepts both digest and legacy plaintext during migration", () => {
    const raw = "legacy-session-token";
    const digest = hashSessionToken(raw);

    expect(getPersistedSessionTokenCandidates(raw)).toEqual([digest, raw]);
    expect(isLegacyPlaintextSessionToken(raw, raw)).toBe(true);
    expect(isLegacyPlaintextSessionToken(digest, raw)).toBe(false);
  });

  test("does not duplicate a token that already equals its persisted candidate", () => {
    const raw = "another-random-session-token";
    const candidates = getPersistedSessionTokenCandidates(raw);

    expect(new Set(candidates).size).toBe(candidates.length);
  });
});
