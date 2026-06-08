export function unformatNumber(value: string | null | undefined): string {
  if (value == null) return '';
  return value.replace(/\D/g, '');
}