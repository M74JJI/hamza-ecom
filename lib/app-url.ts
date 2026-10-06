type AppUrlEnvironment = {
  APP_URL?: string;
  NODE_ENV?: string;
};

export function getAppUrl(env: AppUrlEnvironment = process.env) {
  const configured = env.APP_URL?.trim();

  if (!configured) {
    if (env.NODE_ENV === "production") {
      throw new Error("APP_URL is required in production");
    }
    return "http://localhost:3000";
  }

  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new Error("APP_URL must be a valid absolute URL");
  }

  if (env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("APP_URL must use HTTPS in production");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("APP_URL must use HTTP or HTTPS");
  }

  return url.origin;
}
