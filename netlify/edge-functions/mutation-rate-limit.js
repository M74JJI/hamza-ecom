export default async function mutationRateLimit(_request, context) {
  return context.next();
}

export const config = {
  name: "Mutation abuse guard",
  path: "/*",
  method: ["POST", "PUT", "PATCH", "DELETE"],
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ["domain", "ip"],
  },
};
