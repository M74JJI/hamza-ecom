export default async function databaseReadRateLimit(_request, context) {
  return context.next();
}

export const config = {
  name: "Database read abuse guard",
  path: [
    "/api/search",
    "/api/search/suggest",
    "/api/filters",
    "/api/categories/header",
    "/api/reviews/*",
    "/api/health",
  ],
  method: "GET",
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ["domain", "ip"],
  },
};
