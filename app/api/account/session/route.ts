// Neutral endpoint avoids privacy extensions that block paths containing
// `/auth/signin`. Keep original route available for backwards compatibility.
export { POST } from "@/app/auth/signin/route";
