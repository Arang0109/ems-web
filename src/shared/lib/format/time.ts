// 서버 시각(LocalTime "HH:mm:ss") ↔ <input type="time"> 값("HH:mm") 변환.

export const formatTime = (value: string | null | undefined): string =>
  value ? value.slice(0, 5) : "";

// 빈 입력은 null. "HH:mm"은 초를 붙여 서버 계약 형식으로 맞춘다.
export const unformatTime = (value: string): string | null => {
  const t = value.trim();
  if (!t) return null;
  return t.length === 5 ? `${t}:00` : t;
};
