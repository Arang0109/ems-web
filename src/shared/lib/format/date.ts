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

export function formatDate(date?: string | Date | null): string {
  if (!date) return '';

  const d = new Date(date);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateDot(date?: string | Date | null): string {
  if (!date) return '';

  const d = new Date(date);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  return `${yyyy}.${mm}.${dd}`;
}
// ─── 채팅 시각 표시 ──────────────────────────────────────────────────────────
//
// 서버가 주는 `LocalDateTime`(`'2026-09-08T14:03:11'`)은 오프셋이 없어 `new Date()` 가
// **로컬 시각**으로 읽는다. 여기서는 그것이 의도한 동작이다 — 서버와 사용자가 같은
// 시간대에 있고, 표시할 값도 "그 사람의 벽시계 시각"이기 때문이다.
// (`formatMonthDay` 가 문자열 분해를 택한 것은 순수 날짜의 UTC 밀림 때문으로, 상황이 다르다.)

const DAY_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'] as const;

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

/** 두 시각이 같은 날(로컬 기준)인지 */
const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** 자정 기준 경과 일수 차. 시각을 버리고 날짜만 비교한다 */
const dayDiff = (from: Date, to: Date): number => {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / (24 * HOUR_MS));
};

/**
 * `'2026-09-08T14:30:11'` → `'오후 2:30'` — 메시지 말풍선 옆 시각.
 *
 * 24시간제(`formatDateTime` 의 `14시 30분`)를 쓰지 않는 이유는 대화 화면에서 시각이
 * 본문 옆에 붙는 보조 정보라서다. 짧을수록 본문을 가리지 않는다.
 */
export function formatClockTime(value?: string | Date | null): string {
  if (!value) return '';

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';

  const hours = d.getHours();
  const meridiem = hours < 12 ? '오전' : '오후';
  // 0시·12시는 12로 표기한다 (0:30 이 아니라 오전 12:30)
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${meridiem} ${hour12}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * `'오늘' | '어제' | '2026년 9월 6일 (토)'` — 대화 타임라인의 일자 구분선.
 *
 * @param today 기준일. 테스트 주입용이며 기본값은 현재 시각이다.
 */
export function formatDayLabel(value?: string | Date | null, today: Date = new Date()): string {
  if (!value) return '';

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';

  const diff = dayDiff(d, today);
  if (diff === 0) return '오늘';
  if (diff === 1) return '어제';

  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_OF_WEEK[d.getDay()]})`;
}

/**
 * 대화 목록의 마지막 메시지 시각. 최근일수록 촘촘하게, 오래될수록 성기게 표시한다.
 *
 * `'방금 전' | '3분 전' | '오후 2:30' | '어제' | '9월 6일' | '2025. 9. 6.'`
 *
 * `date-fns` 의 `formatDistanceToNow` 를 쓰지 않는 이유: `'약 1분'`·`'1분 미만'` 처럼
 * 어림수를 붙인 문구를 내는데, 목록에서 훑어보는 시각으로는 장황하다.
 *
 * @param now 기준 시각. 테스트 주입용이며 기본값은 현재 시각이다.
 */
export function formatRelativeTime(value?: string | Date | null, now: Date = new Date()): string {
  if (!value) return '';

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';

  const elapsed = now.getTime() - d.getTime();

  // 미래 시각(기기 시계 차이)은 '방금 전'으로 뭉갠다 — '-3분 전'을 보여줄 수는 없다
  if (elapsed < MINUTE_MS) return '방금 전';
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}분 전`;

  // 한 시간이 지나면 상대 표현을 버린다. '5시간 전'보다 '오후 2:30'이 대조하기 쉽다
  if (isSameDay(d, now)) return formatClockTime(d);
  if (dayDiff(d, now) === 1) return '어제';
  if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}월 ${d.getDate()}일`;

  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}
