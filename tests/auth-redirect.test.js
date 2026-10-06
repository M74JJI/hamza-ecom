import { describe, expect, test } from "bun:test";
import { getSafeCallbackPath } from "../lib/auth/redirect.ts";

describe("getSafeCallbackPath", () => {
  test("accepts local absolute paths", () => {
    expect(getSafeCallbackPath("/")).toBe("/");
    expect(getSafeCallbackPath("/checkout")).toBe("/checkout");
    expect(getSafeCallbackPath("/browse?q=shoes#top")).toBe("/browse?q=shoes#top");
  });

  test("rejects external and protocol-relative redirects", () => {
    expect(getSafeCallbackPath("https://evil.example")).toBe("/");
    expect(getSafeCallbackPath("//evil.example/path")).toBe("/");
    expect(getSafeCallbackPath("javascript:alert(1)")).toBe("/");
  });

  test("rejects backslashes, controls, empty and non-string values", () => {
    expect(getSafeCallbackPath("/\\evil.example")).toBe("/");
    expect(getSafeCallbackPath("/safe\nunsafe")).toBe("/");
    expect(getSafeCallbackPath("   ")).toBe("/");
    expect(getSafeCallbackPath(null)).toBe("/");
  });
});
