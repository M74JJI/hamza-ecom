import { createHash } from "node:crypto";

export const SESSION_COOKIE_NAME = "session";

export function hashSessionToken(rawToken: string) {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

export function getPersistedSessionTokenCandidates(rawToken: string) {
  const hashed = hashSessionToken(rawToken);
  return hashed === rawToken ? [hashed] : [hashed, rawToken];
}

export function isLegacyPlaintextSessionToken(
  persistedToken: string,
  rawToken: string,
) {
  return persistedToken === rawToken && persistedToken !== hashSessionToken(rawToken);
}
