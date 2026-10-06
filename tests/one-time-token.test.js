import { describe, expect, test } from "bun:test";
import {
  createOneTimeToken,
  getPersistedOneTimeTokenCandidates,
  hashOneTimeToken,
  isLegacyPlaintextOneTimeToken,
} from "../lib/one-time-token.ts";

describe("one-time token persistence", () => {
  test("generates high-entropy URL-safe bearer tokens", () => {
    const first = createOneTimeToken();
    const second = createOneTimeToken();

    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(43);
    expect(first).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  test("persists a deterministic SHA-256 digest instead of the bearer token", () => {
    const raw = createOneTimeToken();
    const digest = hashOneTimeToken(raw);

    expect(digest).toHaveLength(64);
    expect(digest).not.toBe(raw);
    expect(hashOneTimeToken(raw)).toBe(digest);
  });

  test("accepts hashed and legacy plaintext rows during rollout", () => {
    const raw = createOneTimeToken();
    const digest = hashOneTimeToken(raw);

    expect(getPersistedOneTimeTokenCandidates(raw)).toEqual([digest, raw]);
    expect(isLegacyPlaintextOneTimeToken(raw, raw)).toBe(true);
    expect(isLegacyPlaintextOneTimeToken(digest, raw)).toBe(false);
  });

  test("does not duplicate a candidate when the raw value equals its digest candidate", () => {
    const raw = "a".repeat(64);
    const candidates = getPersistedOneTimeTokenCandidates(raw);

    expect(new Set(candidates).size).toBe(candidates.length);
  });
});
