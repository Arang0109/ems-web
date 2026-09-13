export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || String(value).trim() === '') return 0;
  const n = Number(String(value).replace(/[,\s]/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

export function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const n = Number(String(value).replace(/[,\s]/g, ''));
  return Number.isNaN(n) ? null : n;
}

export function toFormValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// ─── 검증 판정 ───

/** Form 문자열이 0 보다 큰 숫자인지. 빈값·파싱 불가는 `false` (콤마·공백은 `toNumberOrNull` 규칙으로 허용) */
export function isPositiveNumber(value: string | null | undefined): boolean {
  const n = toNumberOrNull(value);
  return n !== null && n > 0;
}

/** Form 문자열이 0 이상의 숫자인지. 빈값·파싱 불가는 `false` */
export function isNonNegativeNumber(value: string | null | undefined): boolean {
  const n = toNumberOrNull(value);
  return n !== null && n >= 0;
}

// ─── 반올림 ───

/**
 * 소수 `scale` 자리에서 반올림한다. Java `BigDecimal.HALF_UP` 과 같다 —
 * **부호와 무관하게 절대값 기준**으로 `.5` 를 올린다 (`roundHalfUp(-2.5, 0)` → `-3`,
 * JS `Math.round(-2.5)` 는 `-2`). 서버 계산을 프론트에서 미러링할 때 이 차이가 값을 가른다.
 *
 * fp 표현 오차(`1.005 * 100 === 100.49999…`)는 미세 nudge 로 흡수한다. `NaN`·`Infinity` 는 그대로 돌려준다.
 */
export function roundHalfUp(value: number, scale: number): number {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** scale;
  const scaled = Math.abs(value) * factor;
  const rounded = Math.round(scaled + 1e-9);
  return (value < 0 ? -rounded : rounded) / factor;
}

// ─── 표시 포맷 ───

/**
 * 없는 값을 대시로 보여준다. `null`·`undefined`·공백 → `'-'`, 그 외는 문자열로.
 * `0` 은 값이다 — 빈 문자열이 되지 않는다. 상세 화면·표 셀처럼 "미입력" 을 한 글자로 표시하는 자리용.
 *
 * 폼 초기값에는 쓰지 말 것 — 그쪽은 빈 문자열을 돌려주는 `toFormValue` 다.
 */
export function displayValue(value: string | number | null | undefined, dash = '-'): string {
  if (value === null || value === undefined) return dash;
  const text = String(value).trim();
  return text === '' ? dash : text;
}

/** 로케일 기본 최대 소수 자릿수. `maxDecimals` 를 생략했을 때의 하한이 된다. */
const DEFAULT_MAX_DECIMALS = 3;

export type FormatNumberOptions = {
  /** 최소 소수 자릿수 — 모자라면 `0` 으로 채운다. `formatNumber(1234.5, { minDecimals: 2 })` → `'1,234.50'` */
  minDecimals?: number;
  /** 최대 소수 자릿수 — 넘으면 반올림한다. 생략 시 기본 3자리(단, `minDecimals` 보다 작아지지 않는다) */
  maxDecimals?: number;
  /**
   * 고정 소수 자릿수 — `minDecimals`·`maxDecimals` 를 같은 값으로 주는 축약. `toFixed(n)` 자리에 쓴다.
   * `formatNumber(1234.5, { decimals: 2 })` → `'1,234.50'`. 둘과 함께 주면 이 값이 이긴다.
   */
  decimals?: number;
};

/**
 * 천 단위 구분 기호를 넣는다. `1234567` → `'1,234,567'`. 금액에 한정하지 않는 범용 표시 포맷.
 *
 * 소수 자릿수를 지정하지 않으면 로케일 기본값인 3자리에서 반올림되므로
 * `0.0004` 같은 미량 값은 `'0'` 이 된다 — 소수가 의미를 갖는 값은 자릿수를 명시할 것.
 *
 * ```ts
 * formatNumber(0.0004, { maxDecimals: 6 })   // '0.0004'  (뒤 0 은 붙이지 않음)
 * formatNumber(1234.5, { minDecimals: 2 })   // '1,234.50' (0 으로 채움)
 * formatNumber(1234.5, { decimals: 2 })     // '1,234.50' (항상 2자리 고정 — `toFixed(2)` 대체)
 * ```
 */
export function formatNumber(
  value: string | number | null | undefined,
  options: FormatNumberOptions = {},
): string {
  if (value === null || value === undefined || value === '') return '';

  const minDecimals = options.decimals ?? options.minDecimals;
  const maxDecimals = options.decimals ?? options.maxDecimals;

  return Number(value).toLocaleString('ko-KR', {
    minimumFractionDigits: minDecimals,
    // Intl 은 max < min 이면 RangeError 를 던진다. maxDecimals 를 생략한 채
    // minDecimals 만 3보다 크게 준 경우를 막으려고 하한을 minDecimals 로 끌어올린다.
    maximumFractionDigits: maxDecimals ?? Math.max(minDecimals ?? 0, DEFAULT_MAX_DECIMALS),
  });
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

/** 계약 금액의 한글 병기용. `120000000` → `'금 일억이천만원'`. 0·빈값은 빈 문자열 */
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
