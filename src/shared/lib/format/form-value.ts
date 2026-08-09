/**
 * Domain(number | null) → Form(string) 변환 — `toNumber` / `toNumberOrNull` 의 역방향.
 *
 * 서버가 nullable로 준 값을 수정 폼의 초기값으로 되돌릴 때 사용한다.
 * `String(null)` 이 `"null"` 문자열이 되는 사고를 막는 것이 이 함수의 존재 이유다.
 */
export function toFormValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value);
}
