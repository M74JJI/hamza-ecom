export default function databaseReadRateLimit() {
  // Returning undefined continues request chain without reading response body.
}

export const config = {
  name: "Database read abuse guard",
  path: [
    "/api/search",
    "/api/search/suggest",
    "/api/filters",
    "/api/categories/header",
    "/api/reviews/*",
  ],
  method: "GET",
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ["domain", "ip"],
  },
};
