export const AUTH_EMAIL_MAX_LENGTH = 254;
export const AUTH_PASSWORD_MIN_LENGTH = 8;
export const AUTH_PASSWORD_MAX_LENGTH = 1024;
export const AUTH_ONE_TIME_TOKEN_MIN_LENGTH = 10;
export const AUTH_ONE_TIME_TOKEN_MAX_LENGTH = 256;

export function isSupportedNewPasswordLength(value: string) {
  return (
    value.length >= AUTH_PASSWORD_MIN_LENGTH &&
    value.length <= AUTH_PASSWORD_MAX_LENGTH
  );
}

export function isReasonableOneTimeToken(
  value: string | null | undefined,
): value is string {
  if (!value) return false;
  return (
    value.length >= AUTH_ONE_TIME_TOKEN_MIN_LENGTH &&
    value.length <= AUTH_ONE_TIME_TOKEN_MAX_LENGTH
  );
}
