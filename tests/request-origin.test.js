import { describe, expect, test } from "bun:test";
import { isSameOriginMutation } from "../lib/security/request-origin.ts";

describe("isSameOriginMutation", () => {
  test("accepts matching Origin against request URL", () => {
    const req = new Request("https://shop.example.com/auth/signin", {
      method: "POST",
      headers: { origin: "https://shop.example.com" },
    });

    expect(isSameOriginMutation(req)).toBe(true);
  });

  test("rejects cross-site Origin", () => {
    const req = new Request("https://shop.example.com/auth/signin", {
      method: "POST",
      headers: { origin: "https://evil.example" },
    });

    expect(isSameOriginMutation(req)).toBe(false);
  });

  test("uses trusted proxy host and protocol when present", () => {
    const req = new Request("http://127.0.0.1:3000/auth/signin", {
      method: "POST",
      headers: {
        origin: "https://shop.example.com",
        "x-forwarded-host": "shop.example.com",
        "x-forwarded-proto": "https",
      },
    });

    expect(isSameOriginMutation(req)).toBe(true);
  });

  test("accepts same-origin Fetch Metadata when Origin is absent", () => {
    const req = new Request("https://shop.example.com/api/auth/signout", {
      method: "POST",
      headers: { "sec-fetch-site": "same-origin" },
    });

    expect(isSameOriginMutation(req)).toBe(true);
  });

  test("rejects missing Origin without same-origin Fetch Metadata", () => {
    const req = new Request("https://shop.example.com/api/auth/signout", {
      method: "POST",
      headers: { "sec-fetch-site": "cross-site" },
    });

    expect(isSameOriginMutation(req)).toBe(false);
  });

  test("rejects opaque/null origins", () => {
    const req = new Request("https://shop.example.com/api/auth/reset/request", {
      method: "POST",
      headers: { origin: "null" },
    });

    expect(isSameOriginMutation(req)).toBe(false);
  });
});
