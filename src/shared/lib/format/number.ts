/**
 * 자릿수 문자열(사업자번호·전화번호 등) 정규화 — 숫자 외 문자를 모두 제거해 문자열로 반환.
 * 숫자 "값"이 아니라 코드/식별자 정규화에 사용한다. (소수점·음수 부호도 제거됨)
 */
export function unformatNumber(value: string | null | undefined): string {
  if (value == null) return '';
  return value.replace(/\D/g, '');
}

/**
 * 필수 숫자 필드용 파싱 — 콤마·공백을 제거하고 number로 변환 (소수·음수 허용).
 * 빈값/파싱 불가 시 0을 반환한다. (필수 필드는 validator가 빈값을 사전 차단하는 전제)
 */
export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || String(value).trim() === '') return 0;
  const n = Number(String(value).replace(/[,\s]/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

/**
 * 선택(nullable) 숫자 필드용 파싱 — 빈값/파싱 불가 시 null을 반환한다.
 * 서버의 nullable 숫자(BigDecimal/Double 등)와 "미지정(null)"을 정확히 매핑한다.
 */
export function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const n = Number(String(value).replace(/[,\s]/g, ''));
  return Number.isNaN(n) ? null : n;
}