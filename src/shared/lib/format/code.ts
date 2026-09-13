// 자릿수 문자열(사업자번호·전화번호·우편번호·SEMS번호 등) 정규화·표시 유틸.
//
// 여기서 다루는 값은 숫자 "값" 이 아니라 코드다 — 전 레이어에서 string 으로 흐르고
// 산술 연산을 하지 않는다. 숫자 값의 파싱·표시는 `./number` 가 맡는다.
//
// **표시와 입력을 가른다.** `formatXxx` 는 화면에 끊어 보여주는 쪽이고(위젯·상세 화면),
// `maskCodeInput` 은 타이핑을 받는 쪽이다. 입력 칸은 `InputGroup` 의 `code` 모드가
// 두 가지를 묶어 쓰므로, 폼에서 이 함수들을 직접 부를 일은 없다.

export function unformatNumber(value: string | null | undefined): string {
  if (value == null) return '';
  return value.replace(/\D/g, '');
}

const totalOf = (sizes: readonly number[]): number =>
  sizes.reduce((sum, size) => sum + size, 0);

const BUSINESS_SIZES = [3, 2, 5] as const;
const PHONE_SIZES = [3, 4, 4] as const;

/** 사업자등록번호 자릿수 (10) — 표시 묶음의 합에서 파생한다. 두 곳에 적지 않는다 */
export const BUSINESS_NUMBER_DIGITS = totalOf(BUSINESS_SIZES);
/** 전화번호 자릿수 (11) */
export const PHONE_NUMBER_DIGITS = totalOf(PHONE_SIZES);

/**
 * 타이핑 중인 자릿수 코드를 정규화한다 — 숫자만 남기고 상한을 넘는 자리는 버린다.
 *
 * 숫자 **값**에는 쓰지 말 것 (`/\D/g` 가 부호와 소수점을 지운다).
 * 값 쪽은 `maskNumericInput` 이다 — 두 줄기를 섞지 않는다.
 */
export const maskCodeInput = (value: string | null | undefined, digits: number): string =>
  unformatNumber(value).slice(0, digits);

function groupDigits(value: string | null | undefined, sizes: readonly number[]): string {
  const digits = maskCodeInput(value, totalOf(sizes));

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
  return groupDigits(value, BUSINESS_SIZES);
}

/**
 * `'01012345678'` → `'010-1234-5678'`
 * 번호 체계를 판별하지 않는다 — 9·10자리 지역번호도 같은 규칙으로 끊는다.
 */
export function formatPhoneNumber(value: string | null | undefined): string {
  return groupDigits(value, PHONE_SIZES);
}