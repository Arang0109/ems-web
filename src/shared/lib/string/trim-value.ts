export function trimValue(value: string | null | undefined): string {
  if (value == null) return '';
  return value.trim();
}