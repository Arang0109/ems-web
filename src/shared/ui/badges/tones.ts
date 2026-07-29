/**
 * 피그마 "운영 상태 · 배지" 톤 체계.
 *
 * 상태를 도메인별 variant 가 아니라 의미 톤으로 표현한다.
 * 같은 톤을 StatusDot(점 + 텍스트)과 Badge(pill) 가 공유한다.
 */
export const STATUS_TONE = [
  'pending', // 예정   — Ink
  'progress', // 진행 중 — 브랜드 초록
  'done', // 완료   — Muted
  'danger', // 지연   — Danger
  'warning', // 확인 필요 — Warning
] as const;

export type StatusTone = (typeof STATUS_TONE)[number];

/** StatusDot 의 점 색상 */
export const TONE_DOT: Record<StatusTone, string> = {
  pending: 'bg-ink',
  progress: 'bg-brand-primary',
  done: 'bg-muted-ink',
  danger: 'bg-danger',
  warning: 'bg-warning',
};

/** StatusDot 의 텍스트 색상 */
export const TONE_TEXT: Record<StatusTone, string> = {
  pending: 'text-ink',
  progress: 'text-brand-dark',
  done: 'text-muted-ink',
  danger: 'text-danger',
  warning: 'text-warning-ink',
};
