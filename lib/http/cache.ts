import "server-only";

export function publicDatabaseCache(seconds: number) {
  const staleSeconds = Math.max(seconds, seconds * 4);

  return {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Netlify-CDN-Cache-Control": `public, durable, s-maxage=${seconds}, stale-while-revalidate=${staleSeconds}`,
  };
}
