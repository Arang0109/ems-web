export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';

  return Number(value).toLocaleString('ko-KR');
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