import { getAppUrl } from "@/lib/app-url";

type OriginEnvironment = {
  APP_URL?: string;
  NODE_ENV?: string;
};

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function getExpectedOrigin(req: Request, env: OriginEnvironment) {
  // In production, compare against the canonical configured origin. Forwarded
  // headers are client-controlled unless the deployment proxy explicitly strips
  // them, so they must not define the CSRF trust boundary.
  if (env.NODE_ENV === "production") {
    try {
      return getAppUrl(env);
    } catch {
      return null;
    }
  }

  const url = new URL(req.url);
  const forwardedProto = firstHeaderValue(req.headers.get("x-forwarded-proto"));
  const forwardedHost = firstHeaderValue(req.headers.get("x-forwarded-host"));
  const host = forwardedHost ?? firstHeaderValue(req.headers.get("host")) ?? url.host;
  const protocol = forwardedProto ?? url.protocol.replace(":", "");

  if (protocol !== "http" && protocol !== "https") {
    return null;
  }

  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    return null;
  }
}

export function isSameOriginMutation(
  req: Request,
  env: OriginEnvironment = process.env,
) {
  const expectedOrigin = getExpectedOrigin(req, env);
  if (!expectedOrigin) return false;

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).origin === expectedOrigin;
    } catch {
      return false;
    }
  }

  // Modern browsers send Fetch Metadata even in the rare case Origin is absent.
  // Do not accept cross-site/unknown POSTs without either signal.
  return req.headers.get("sec-fetch-site") === "same-origin";
}
