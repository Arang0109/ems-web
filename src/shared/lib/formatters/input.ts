export function formatBusinessNumber(value: string | null | undefined): string {
  if (value == null) return '';
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export function formatPhoneNumber(value: string | null | undefined): string {
  if (value == null) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function stripFormatting(value: string | null | undefined): string {
  if (value == null) return '';
  return value.replace(/\D/g, '');
}

export function trimValue(value: string | null | undefined): string {
  if (value == null) return '';
  return value.trim();
}

export function toDateString(date: Date | null | undefined): string {
  if (date == null) return '';
  return date.toISOString().split("T")[0];
}