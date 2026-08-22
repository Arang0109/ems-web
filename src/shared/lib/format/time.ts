// 서버 시각(LocalTime "HH:mm:ss") ↔ <input type="time"> 값("HH:mm") 변환.

export const formatTime = (value: string | null | undefined): string =>
  value ? value.slice(0, 5) : "";

// 빈 입력은 null. "HH:mm"은 초를 붙여 서버 계약 형식으로 맞춘다.
export const unformatTime = (value: string): string | null => {
  const t = value.trim();
  if (!t) return null;
  return t.length === 5 ? `${t}:00` : t;
};

/** 하루의 분 수 — 자정 순환의 계수 */
const MINUTES_PER_DAY = 1440;

/**
 * `"HH:mm"` → 자정 기준 분(0~1439). 비었거나 파싱 불가면 `null`.
 * 시각 비교·구간 계산은 문자열이 아니라 이 분 값으로 한다.
 */
export const toMinutes = (time: string): number | null => {
  if (!time) return null;

  const [h, m] = time.split(":").map(Number);
  if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) return null;

  return h * 60 + m;
};

/** 분 → `"HH:mm"`. 하루를 벗어나면 24시간으로 순환한다(음수 포함). */
export const fromMinutes = (minutes: number): string => {
  const wrapped = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  const hh = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const mm = String(wrapped % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

/**
 * "HH:mm" 에 분을 더해 "HH:mm" 으로 반환. 자정을 넘기면 24시간으로 순환한다.
 * 입력이 비었거나 파싱 불가면 `null` — 표시용 대체값(`"--:--"`, `""`)은 호출부가 정한다.
 */
export const addMinutes = (time: string, minutes: number): string | null => {
  const base = toMinutes(time);
  if (base === null) return null;

  return fromMinutes(base + Math.round(minutes));
};

/** 타이핑 중 허용하는 숫자 자릿수 — HHmm */
const TIME_DIGITS = 4;

/**
 * 타이핑 중인 값을 `"HH:mm"` 골격으로 마스킹한다. **미완성 값을 그대로 허용**하므로
 * (`"1"` → `"1"`, `"14"` → `"14:"`) 결과가 항상 유효한 시각은 아니다.
 * 확정은 `normalizeTime` 이 한다.
 *
 * 두 규칙이 시(hour)를 항상 2자리로 고정한다 — 덕분에 이후 자릿수는 전부 분이다.
 * - 첫 자리가 3~9 면 시가 더 붙을 수 없으므로 `"9"` → `"09:"` 으로 앞당긴다.
 * - 앞 두 자리가 시로 성립하지 않으면(`"93"`) 첫 자리만 시로 본다 — 붙여넣기 보정.
 *
 * > 백스페이스로 콜론만 지운 경우 이 함수는 콜론을 즉시 되살려 삭제가 먹히지 않는다.
 * > 호출부는 "지우는 중인데 결과가 그대로면 숫자 한 자리를 더 지운다"로 보정한다
 * > (`shared/ui/form/TimeField.tsx` 참조).
 */
export const maskTimeInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, TIME_DIGITS);
  if (!digits) return "";

  if (digits.length === 1) return Number(digits) > 2 ? `0${digits}:` : digits;

  const isTwoDigitHour = Number(digits.slice(0, 2)) <= 23;
  const hh = isTwoDigitHour ? digits.slice(0, 2) : `0${digits.slice(0, 1)}`;
  const mm = isTwoDigitHour ? digits.slice(2) : digits.slice(1, 3);

  return mm ? `${hh}:${mm}` : `${hh}:`;
};

/**
 * 미완성 입력을 확정된 `"HH:mm"` 으로 보정한다. 빈 입력은 `""` — 0 시 0 분으로 바꾸지 않는다.
 *
 * 시 판정은 `maskTimeInput` 과 같고(그래서 먼저 통과시킨다), 남은 분 자리를 0 으로 채운다.
 * `"9"` → `09:00`, `"14:3"` → `14:03`, `"930"` → `09:30`.
 * 분이 범위를 벗어나면 잘라내지 않고 상한(59)으로 붙인다 —
 * 현장에서 오타 한 자리 때문에 값이 통째로 사라지는 편이 더 나쁘다.
 */
export const normalizeTime = (value: string): string => {
  const digits = maskTimeInput(value).replace(/\D/g, "");
  if (!digits) return "";

  const hh = Number(digits.slice(0, 2).padStart(2, "0"));
  const mm = Math.min(Number(digits.slice(2).padStart(2, "0")), 59);

  return fromMinutes(hh * 60 + mm);
};
