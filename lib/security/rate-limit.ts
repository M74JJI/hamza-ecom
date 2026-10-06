import { prisma } from "@/lib/db";
import {
  makeRateLimitKey,
  type RateLimitDecision,
} from "@/lib/security/rate-limit-policy";

export {
  getClientIp,
  makeRateLimitKey,
  maxRetryAfter,
  normalizeRateLimitIdentifier,
  type RateLimitDecision,
} from "@/lib/security/rate-limit-policy";

const DAY_MS = 24 * 60 * 60 * 1000;

function getRateLimitSecret() {
  const configured = process.env.RATE_LIMIT_HASH_SECRET?.trim();
  if (configured && configured.length >= 32) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "RATE_LIMIT_HASH_SECRET must be configured with at least 32 characters in production",
    );
  }

  return "development-only-rate-limit-secret-32-chars";
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

  const key = makeRateLimitKey(scope, identifier, getRateLimitSecret());
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
