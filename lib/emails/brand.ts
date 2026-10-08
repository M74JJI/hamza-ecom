import { getAppUrl } from "@/lib/app-url";

export function getEmailBrandUrls() {
  const appUrl = getAppUrl();
  return {
    appUrl,
    logoUrl: `${appUrl}/brand/hamza-logo.png`,
  };
}
