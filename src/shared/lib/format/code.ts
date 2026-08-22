// 자릿수 문자열(사업자번호·전화번호·우편번호·SEMS번호 등) 정규화·표시 유틸.
//
// 여기서 다루는 값은 숫자 "값" 이 아니라 코드다 — 전 레이어에서 string 으로 흐르고
// 산술 연산을 하지 않는다. 숫자 값의 파싱·표시는 `./number` 가 맡는다.

export function unformatNumber(value: string | null | undefined): string {
  if (value == null) return '';
  return value.replace(/\D/g, '');
}

function groupDigits(value: string | null | undefined, sizes: readonly number[]): string {
  const digits = unformatNumber(value).slice(0, sizes.reduce((sum, size) => sum + size, 0));

  const groups: string[] = [];
  let offset = 0;

  sizes.forEach((size, index) => {
    if (offset >= digits.length) return;

    const isLast = index === sizes.length - 1;
    groups.push(isLast ? digits.slice(offset) : digits.slice(offset, offset + size));
    offset += size;
  });

  return groups.join('-');
}

/** `'2383248234'` → `'238-32-48234'` */
export function formatBusinessNumber(value: string | null | undefined): string {
  return groupDigits(value, [3, 2, 5]);
}

/**
 * `'01012345678'` → `'010-1234-5678'`
 * 번호 체계를 판별하지 않는다 — 9·10자리 지역번호도 같은 규칙으로 끊는다.
 */
export function formatPhoneNumber(value: string | null | undefined): string {
  return groupDigits(value, [3, 4, 4]);
}