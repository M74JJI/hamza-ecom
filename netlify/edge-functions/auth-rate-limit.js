export default async function authRateLimit(_request, context) {
  return context.next();
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
