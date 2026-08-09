/**
 * `'2026-08-15'` → `'8월 15일'`
 *
 * 좁은 폭에 날짜만 표시할 때 쓴다. 서버의 `LocalDate`(날짜 문자열)를 그대로 문자열로 다룬다 —
 * `new Date('2026-08-15')` 는 UTC 로 파싱되어 타임존에 따라 하루 밀릴 수 있기 때문이다.
 */
export function formatMonthDay(date?: string | null): string {
  if (!date) return '';

  const [, mm, dd] = date.split('-');
  if (!mm || !dd) return date;

  return `${Number(mm)}월 ${Number(dd)}일`;
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