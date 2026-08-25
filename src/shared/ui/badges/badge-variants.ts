import { cva, type VariantProps } from 'class-variance-authority';

/**
 * 피그마 "운영 상태 · 배지" 의 pill 배지.
 *
 * shadcn(Base UI) Badge 에 의존하지 않는 자체 구현이다.
 * 코너는 반경 스펙의 "Full · count" 에 따라 rounded-full 을 쓴다.
 *
 * 운영 상태 자체를 나타낼 때는 Badge 가 아니라 StatusDot 을 쓴다.
 * Badge 는 건수("5건")·구분값("초안")·주의 표시("만료 임박")·안내문에 쓴다.
 */
export const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 h-6 px-2.5 rounded-full text-label whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      tone: {
        /** 건수·강조 — "5건" */
        brand: 'bg-brand-soft text-brand-dark',
        /** 구분값 — "초안" */
        neutral: 'bg-rule text-ink-soft',
        /** 주의 — "만료 임박" */
        danger: 'bg-danger-soft text-danger',
        /** 안내 — "불러옴 8" 처럼 오류도 경고도 아닌 참고 표시 */
        info: 'bg-info-soft text-info-ink',
        /** 확인 필요 */
        warning: 'bg-warning-soft text-warning-ink',
        /** 안내문 — "상태 변경은 이력에 남습니다." */
        solid: 'bg-ink-soft text-surface',

        danger_nonline: 'text-danger',

        warning_nonline: 'text-warning'
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  }
);

/** Badge 의 톤 값 — 호출부가 톤을 계산해서 넘길 때 쓴다 */
export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;