/**
 * 피그마 "운영 상태 · 배지" 톤 체계.
 *
 * 상태를 도메인별 variant 가 아니라 의미 톤으로 표현한다.
 * 같은 톤을 StatusDot(점 + 텍스트)과 Badge(pill) 가 공유한다.
 *
 * `active`·`info`·`success` 는 피그마 스펙의 확장이다. 측정계획처럼 **진행 단계가 여럿인**
 * 도메인은 "진행 중"을 한 색으로 묶으면 어느 단계인지 색으로 읽히지 않기 때문에,
 * 단계별로 색이 갈리도록 톤을 늘렸다.
 *
 * `active`/`warning`, `success`/`progress` 는 색값이 같다. 색을 아끼려고 한쪽으로 합치지 않는 이유는
 * **이름이 곧 쓰임을 제한하기 때문**이다 — 정상 진행 중인 단계에 `warning` 을, 확정된 종료 상태에
 * `progress` 를 붙이면 다음 사람이 그 색을 경고·진행으로 잘못 읽는다. 색이 겹치는 것은 화면에서
 * 두 톤이 같이 놓이지 않는 한 문제가 되지 않지만, 이름이 거짓말하면 매번 문제가 된다.
 */
export const STATUS_TONE = [
  'pending', // 대기      — Ink Soft (아직 아무 일도 시작되지 않음)
  'active', // 진행 중    — Warning 앰버 (사람이 붙어 있는 현장 단계)
  'info', // 진행 중      — Info 파랑 (같은 진행이라도 다른 공정임을 색으로 가른다)
  'progress', // 진행 중  — 브랜드 초록 (단계가 하나뿐인 도메인의 "사용 중")
  'success', // 확정 완료 — 브랜드 초록 (정상적으로 끝났음)
  'done', // 종료·비활성  — Muted (끝났거나 꺼져 있음, 좋고 나쁨이 없음)
  'danger', // 지연·중단  — Danger
  'warning', // 확인 필요 — Warning
] as const;

export type StatusTone = (typeof STATUS_TONE)[number];

/** StatusDot 의 점 색상 */
export const TONE_DOT: Record<StatusTone, string> = {
  pending: 'bg-ink-soft',
  active: 'bg-warning',
  info: 'bg-info',
  progress: 'bg-brand-primary',
  success: 'bg-brand-primary',
  done: 'bg-muted-ink',
  danger: 'bg-danger',
  warning: 'bg-warning',
};

/**
 * pill 형태로 감쌀 때의 면 색상.
 * 피그마 모바일 카드의 상태 칩(진행 중 = Brand Soft, 그 외 = Rule 50%)에서 왔다.
 */
export const TONE_SURFACE: Record<StatusTone, string> = {
  pending: 'bg-rule/50',
  active: 'bg-warning-soft',
  info: 'bg-info-soft',
  progress: 'bg-brand-soft',
  success: 'bg-brand-soft',
  done: 'bg-rule/50',
  danger: 'bg-danger-soft',
  warning: 'bg-warning-soft',
};

/** StatusDot 의 텍스트 색상 */
export const TONE_TEXT: Record<StatusTone, string> = {
  pending: 'text-ink-soft',
  active: 'text-warning-ink',
  info: 'text-info-ink',
  progress: 'text-brand-dark',
  success: 'text-brand-dark',
  done: 'text-muted-ink',
  danger: 'text-danger',
  warning: 'text-warning-ink',
};
