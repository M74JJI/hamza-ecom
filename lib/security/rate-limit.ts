import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";

const DAY_MS = 24 * 60 * 60 * 1000;

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

export function makeRateLimitKey(scope: string, identifier: string) {
  const digest = createHash("sha256")
    .update(`${scope}\0${normalizeRateLimitIdentifier(identifier)}`)
    .digest("hex");

  return `${scope}:${digest}`;
}

export async function consumeRateLimit({
  scope,
  identifier,
  limit,
  windowMs,
}: {
  scope: string;
  identifier: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitDecision> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Rate-limit limit must be a positive integer");
  }
  if (!Number.isFinite(windowMs) || windowMs < 1_000) {
    throw new Error("Rate-limit window must be at least one second");
  }

  const key = makeRateLimitKey(scope, identifier);
  const now = Date.now();
  const nextExpiry = new Date(now + windowMs);

  const rows = await prisma.$queryRaw<Array<{ count: number; expiresAt: Date }>>`
    INSERT INTO "RateLimitBucket"
      ("key", "count", "windowStart", "expiresAt", "updatedAt")
    VALUES
      (${key}, 1, CURRENT_TIMESTAMP, ${nextExpiry}, CURRENT_TIMESTAMP)
    ON CONFLICT ("key") DO UPDATE
    SET
      "count" = CASE
        WHEN "RateLimitBucket"."expiresAt" <= CURRENT_TIMESTAMP THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "RateLimitBucket"."expiresAt" <= CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP
        ELSE "RateLimitBucket"."windowStart"
      END,
      "expiresAt" = CASE
        WHEN "RateLimitBucket"."expiresAt" <= CURRENT_TIMESTAMP THEN EXCLUDED."expiresAt"
        ELSE "RateLimitBucket"."expiresAt"
      END,
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "count", "expiresAt"
  `;

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to update rate-limit bucket");
  }

  const count = Number(row.count);
  const expiresAt = new Date(row.expiresAt).getTime();

  // Opportunistic indexed cleanup on a small deterministic fraction of keys.
  if (Number.parseInt(key.slice(-2), 16) < 8) {
    await prisma.rateLimitBucket.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(now - DAY_MS),
        },
      },
    });
  }

  return {
    allowed: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: Math.max(1, Math.ceil((expiresAt - now) / 1000)),
  };
}

export function maxRetryAfter(decisions: RateLimitDecision[]) {
  return Math.max(
    1,
    ...decisions
      .filter((decision) => !decision.allowed)
      .map((decision) => decision.retryAfterSeconds),
  );
}
