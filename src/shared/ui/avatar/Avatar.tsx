import { cn } from '@/lib/utils';

const SIZE_CLASS = {
  sm: 'size-6 text-caption',
  md: 'size-8 text-label',
  lg: 'size-10 text-body-4',
} as const;

/** 접속 점 크기 — 아바타가 커질수록 함께 커진다 */
const DOT_CLASS = {
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3',
} as const;

type Size = keyof typeof SIZE_CLASS;

type StatusProps =
  | {
      /** 우하단 접속 상태 점. 생략하면 점을 그리지 않는다 */
      online?: undefined;
      statusLabel?: never;
    }
  | {
      online: boolean;
      /**
       * 점의 접근성 이름 — `'온라인'` · `'오프라인'`.
       *
       * `online` 을 주면 필수다. 점은 색만으로 상태를 말하므로 이름이 없으면
       * 스크린리더 사용자와 색각 이상 사용자에게 아무 정보가 아니다
       * ({@link StatusDot} 이 `label` 을 필수로 둔 것과 같은 근거).
       */
      statusLabel: string;
    };

type Props = {
  /** 이니셜을 뽑을 이름. 비어 있으면 `?` — 삭제된 계정이 그 경우다 */
  name?: string | null;
  size?: Size;
  className?: string;
} & StatusProps;

/**
 * 이니셜 아바타 — 이름 첫 글자를 딴 원형 + (선택) 접속 상태 점.
 *
 * 프로필 이미지를 받지 않는다. 서버에 사용자 이미지가 없고, 있다 치더라도
 * 채팅 목록에서 N개를 동시에 받아 오는 비용을 이니셜이 대신하고 있다.
 */
export const Avatar = ({ name, size = 'md', online, statusLabel, className }: Props) => (
  <span className={cn('relative inline-flex shrink-0', className)}>
    <span
      aria-hidden="true"
      className={cn(
        'flex items-center justify-center rounded-full bg-brand-soft text-brand-dark',
        SIZE_CLASS[size]
      )}
    >
      {name?.trim()?.charAt(0) || '?'}
    </span>

    {online !== undefined && (
      <span
        role="img"
        aria-label={statusLabel}
        title={statusLabel}
        className={cn(
          // ring 으로 배경을 파내야 아바타 위에 얹힌 점의 경계가 산다
          'absolute -end-0.5 -bottom-0.5 rounded-full ring-2 ring-surface',
          DOT_CLASS[size],
          online ? 'bg-brand-primary' : 'bg-muted-ink'
        )}
      />
    )}
  </span>
);
