import { createHmac } from "node:crypto";

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

export function normalizeRateLimitIdentifier(value: string) {
  return value.trim().toLowerCase().slice(0, 512);
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 128);

  return "unknown";
}

export function makeRateLimitKey(
  scope: string,
  identifier: string,
  secret: string,
) {
  const digest = createHmac("sha256", secret)
    .update(`${scope}\0${normalizeRateLimitIdentifier(identifier)}`)
    .digest("hex");

  return `${scope}:${digest}`;
}

export function maxRetryAfter(decisions: RateLimitDecision[]) {
  return Math.max(
    1,
    ...decisions
      .filter((decision) => !decision.allowed)
      .map((decision) => decision.retryAfterSeconds),
  );
}
