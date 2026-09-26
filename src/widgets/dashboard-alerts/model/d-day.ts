/**
 * 만료 알림의 잔여일수 표기·강조 톤.
 *
 * 서버는 `daysRemaining` 을 "오늘부터 기한까지의 일수"로 계산한다.
 * 계약은 미래 건만 내려오므로 항상 0 이상이지만, 교정은 기한 초과분도 포함되어 음수가 올 수 있다.
 */

export const formatDDay = (days: number): string => {
  if (days < 0) return `${Math.abs(days)}일 초과`;
  if (days === 0) return 'D-DAY';
  return `D-${days}`;
};

/**
 * 기한 초과·30일 이내는 danger, 65일 이내는 warning, 그 밖은 neutral.
 *
 * TODO 임계값(30/65일) 확인 필요 — 기존 주석은 "1주/1개월"이라 적혀 있었으나 구현과 달랐다.
 * 어느 쪽이 맞는지는 제품 결정이라 구현을 유지하고 주석만 맞춰 둔다.
 */
export const toDDayTone = (days: number) => {
  if (days <= 30) return 'danger_nonline' as const;
  if (days <= 65) return 'warning_nonline' as const;
  return 'neutral' as const;
};
