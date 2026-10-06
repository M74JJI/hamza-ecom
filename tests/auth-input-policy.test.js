import { describe, expect, test } from "bun:test";
import {
  AUTH_ONE_TIME_TOKEN_MAX_LENGTH,
  AUTH_ONE_TIME_TOKEN_MIN_LENGTH,
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  isReasonableOneTimeToken,
  isSupportedNewPasswordLength,
} from "../lib/auth/input-policy.ts";
import { getPersistedOneTimeTokenCandidates } from "../lib/one-time-token.ts";

describe("auth input policy", () => {
  test("accepts supported new password lengths", () => {
    expect(isSupportedNewPasswordLength("x".repeat(AUTH_PASSWORD_MIN_LENGTH))).toBe(true);
    expect(isSupportedNewPasswordLength("x".repeat(AUTH_PASSWORD_MAX_LENGTH))).toBe(true);
  });

  test("rejects too-short and oversized new passwords", () => {
    expect(isSupportedNewPasswordLength("x".repeat(AUTH_PASSWORD_MIN_LENGTH - 1))).toBe(false);
    expect(isSupportedNewPasswordLength("x".repeat(AUTH_PASSWORD_MAX_LENGTH + 1))).toBe(false);
  });

  test("accepts one-time tokens only inside the bounded range", () => {
    expect(isReasonableOneTimeToken("x".repeat(AUTH_ONE_TIME_TOKEN_MIN_LENGTH))).toBe(true);
    expect(isReasonableOneTimeToken("x".repeat(AUTH_ONE_TIME_TOKEN_MAX_LENGTH))).toBe(true);
    expect(isReasonableOneTimeToken("x".repeat(AUTH_ONE_TIME_TOKEN_MIN_LENGTH - 1))).toBe(false);
    expect(isReasonableOneTimeToken("x".repeat(AUTH_ONE_TIME_TOKEN_MAX_LENGTH + 1))).toBe(false);
  });

  test("never generates database lookup candidates for oversized tokens", () => {
    expect(
      getPersistedOneTimeTokenCandidates("x".repeat(AUTH_ONE_TIME_TOKEN_MAX_LENGTH + 1)),
    ).toEqual([]);
  });
});
