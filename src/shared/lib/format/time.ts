// 서버 시각(LocalTime "HH:mm:ss") ↔ <input type="time"> 값("HH:mm") 변환.

export const formatTime = (value: string | null | undefined): string =>
  value ? value.slice(0, 5) : "";

// 빈 입력은 null. "HH:mm"은 초를 붙여 서버 계약 형식으로 맞춘다.
export const unformatTime = (value: string): string | null => {
  const t = value.trim();
  if (!t) return null;
  return t.length === 5 ? `${t}:00` : t;
};

/**
 * "HH:mm" 에 분을 더해 "HH:mm" 으로 반환. 자정을 넘기면 24시간으로 순환한다.
 * 입력이 비었거나 파싱 불가면 `null` — 표시용 대체값(`"--:--"`, `""`)은 호출부가 정한다.
 */
export const addMinutes = (time: string, minutes: number): string | null => {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) return null;

  const total = h * 60 + m + Math.round(minutes);
  const wrapped = ((total % 1440) + 1440) % 1440;

  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`;
};
