import { cn } from '@/lib/utils';

import { TONE_DOT, TONE_TEXT, type StatusTone } from './tones';

interface Props {
  tone: StatusTone;
  label: string;
  className?: string;
}

/**
 * 운영 상태 표시 — 점과 텍스트를 함께 보여준다.
 *
 * 피그마 원칙: "상태는 텍스트와 점을 함께 표시하고, 색상만으로 구분하지 않습니다."
 * 따라서 label 은 필수이며, 같은 톤을 여러 상태가 공유해도 무방하다.
 * (예: 측정중·분석중은 둘 다 progress 이고 텍스트로 구분된다.)
 */
export const StatusDot = ({ tone, label, className }: Props) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 text-body-4 whitespace-nowrap',
      TONE_TEXT[tone],
      className
    )}
  >
    <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', TONE_DOT[tone])} />
    {label}
  </span>
);
