const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;

export function getSafeCallbackPath(value: unknown) {
  if (typeof value !== "string") return "/";

  const callback = value.trim();
  if (
    callback.length === 0 ||
    !callback.startsWith("/") ||
    callback.startsWith("//") ||
    callback.includes("\\") ||
    CONTROL_CHARACTERS.test(callback)
  ) {
    return "/";
  }

  return callback;
}
