export default function healthRateLimit() {
  // Returning undefined continues request chain without reading response body.
}

export const config = {
  name: "Database health abuse guard",
  path: "/api/health",
  method: "GET",
  rateLimit: {
    windowLimit: 10,
    windowSize: 60,
    aggregateBy: ["domain", "ip"],
  },
};
