export function isValidMoroccanPhone(input: string): boolean {
  const s = (input || '').replace(/\s|-/g, '');
  // Accept: +2126..., +2127..., 06..., 07...
  return /^(\+212|0)(6|7)\d{8}$/.test(s);
}
