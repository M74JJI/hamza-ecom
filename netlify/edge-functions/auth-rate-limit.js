export default function authRateLimit() {
  // Returning undefined continues request chain without reading response body.
}

export const config = {
  name: "Auth abuse guard",
  path: [
    "/auth/signin",
    "/auth/signup",
    "/api/account/session",
    "/api/auth/reset/request",
    "/api/auth/reset/confirm",
    "/api/auth/verify",
  ],
  rateLimit: {
    windowLimit: 12,
    windowSize: 60,
    aggregateBy: ["domain", "ip"],
  },
};
