import { createHash, randomBytes } from "node:crypto";

export function createOneTimeToken() {
  return randomBytes(32).toString("base64url");
}

export function hashOneTimeToken(rawToken: string) {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

export function getPersistedOneTimeTokenCandidates(rawToken: string) {
  const hashed = hashOneTimeToken(rawToken);
  return hashed === rawToken ? [hashed] : [hashed, rawToken];
}

export function isLegacyPlaintextOneTimeToken(
  persistedToken: string,
  rawToken: string,
) {
  return persistedToken === rawToken && persistedToken !== hashOneTimeToken(rawToken);
}
