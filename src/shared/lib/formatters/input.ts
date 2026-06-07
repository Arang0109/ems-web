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

export function unformatNumber(value: string | null | undefined): string {
  if (value == null) return '';
  return value.replace(/\D/g, '');
}

export function trimValue(value: string | null | undefined): string {
  if (value == null) return '';
  return value.trim();
}

export function formatDateTime(date?: string | Date | null): string {
  if (!date) return '';

  const d = new Date(date);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd} ${hh}시 ${min}분`;
}

export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';

  return Number(value).toLocaleString('ko-KR');
}

export function unformatMoney(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;

  return Number(String(value).replace(/,/g, ''));
}

const KR_DIGITS = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];

function convertGroup(n: number): string {
  if (n === 0) return '';
  const result =
    (n >= 1000 ? KR_DIGITS[Math.floor(n / 1000)] + '천' : '') +
    (n % 1000 >= 100 ? KR_DIGITS[Math.floor((n % 1000) / 100)] + '백' : '') +
    (n % 100 >= 10 ? KR_DIGITS[Math.floor((n % 100) / 10)] + '십' : '') +
    (n % 10 > 0 ? KR_DIGITS[n % 10] : '');
  return result;
}

export function toKoreanAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';

  const num = Number(String(value).replace(/,/g, ''));
  if (isNaN(num) || num === 0) return '';

  const 조 = Math.floor(num / 1_000_000_000_000);
  const 억 = Math.floor((num % 1_000_000_000_000) / 100_000_000);
  const 만 = Math.floor((num % 100_000_000) / 10_000);
  const 나머지 = num % 10_000;

  const body =
    (조 > 0 ? convertGroup(조) + '조' : '') +
    (억 > 0 ? convertGroup(억) + '억' : '') +
    (만 > 0 ? convertGroup(만) + '만' : '') +
    (나머지 > 0 ? convertGroup(나머지) : '');

  return `금 ${body}원`;
}
