import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import { TONE_SURFACE, TONE_TEXT } from './tones';

/**
 * 피그마 "운영 상태 · 배지" 의 pill 배지.
 *
 * shadcn(Base UI) Badge 에 의존하지 않는 자체 구현이다.
 * 코너는 반경 스펙의 "Full · count" 에 따라 rounded-full 을 쓴다.
 *
 * 운영 상태 자체를 나타낼 때는 Badge 가 아니라 StatusDot 을 쓴다.
 * Badge 는 건수("5건")·구분값("초안")·주의 표시("만료 임박")·안내문에 쓴다.
 *
 * 색은 `tones.ts` 의 면·글씨 맵에서 가져온다 — StatusDot 칩과 Badge 가 같은 뜻에 같은 색을 쓰게 한다.
 */
export const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      tone: {
        /** 건수·강조 — "5건" */
        brand: cn(TONE_SURFACE.progress, TONE_TEXT.progress),
        /** 강한 표식 — 목록에서 한 건을 먼저 잡히게 할 때(예: 측정계획 "오늘") */
        'brand-solid': 'bg-brand-primary text-surface',
        /** 구분값 — "초안" */
        neutral: 'bg-rule text-ink-soft',
        /** 주의 — "만료 임박" */
        danger: cn(TONE_SURFACE.danger, TONE_TEXT.danger),
        /** 안내 — "불러옴 8" 처럼 오류도 경고도 아닌 참고 표시 */
        info: cn(TONE_SURFACE.info, TONE_TEXT.info),
        /** 확인 필요 */
        warning: cn(TONE_SURFACE.warning, TONE_TEXT.warning),
        /** 안내문 — "상태 변경은 이력에 남습니다." */
        solid: 'bg-ink-soft text-surface',

        /**
         * 면 없이 글씨색만 — 사실상 배지가 아니라 강조 글씨다(대시보드 D-day).
         * 디자인 시스템 프리뷰가 공개 예시로 보여 주고 있어 이름을 유지한다.
         */
        danger_nonline: TONE_TEXT.danger,
        warning_nonline: TONE_TEXT.warning,
      },
      size: {
        default: 'h-6 px-2.5 text-label',
        /** 제목 위에 얹는 작은 표식 */
        sm: 'px-1.5 py-px text-caption',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'default',
    },
  }
);

/** Badge 의 톤 값 — 호출부가 톤을 계산해서 넘길 때 쓴다 */
export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;
