import { describe, expect, test } from "bun:test";
import { getAppUrl } from "../lib/app-url.ts";

describe("getAppUrl", () => {
  test("uses localhost only outside production when APP_URL is absent", () => {
    expect(getAppUrl({ NODE_ENV: "development" })).toBe("http://localhost:3000");
    expect(getAppUrl({ NODE_ENV: "test" })).toBe("http://localhost:3000");
  });

  test("requires explicit APP_URL in production", () => {
    expect(() => getAppUrl({ NODE_ENV: "production" })).toThrow(
      "APP_URL is required in production",
    );
  });

  test("requires HTTPS in production", () => {
    expect(() =>
      getAppUrl({ NODE_ENV: "production", APP_URL: "http://shop.example.com" }),
    ).toThrow("APP_URL must use HTTPS in production");
  });

  test("returns only the configured canonical origin", () => {
    expect(
      getAppUrl({
        NODE_ENV: "production",
        APP_URL: "https://shop.example.com/some/path?ignored=1",
      }),
    ).toBe("https://shop.example.com");
  });

  test("rejects invalid and non-http URL schemes", () => {
    expect(() =>
      getAppUrl({ NODE_ENV: "development", APP_URL: "not a url" }),
    ).toThrow("APP_URL must be a valid absolute URL");

    expect(() =>
      getAppUrl({ NODE_ENV: "development", APP_URL: "ftp://example.com" }),
    ).toThrow("APP_URL must use HTTP or HTTPS");
  });
});
