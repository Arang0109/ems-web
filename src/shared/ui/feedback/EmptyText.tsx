import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  /** 카드 안 좁은 슬롯 */
  sm: "py-4",
  /** 패널 본문 */
  md: "py-8",
  /** 화면 전체가 비었을 때 */
  lg: "py-12",
} as const;

const TONE_CLASS = {
  muted: "text-muted-ink",
  /** 불러오기 실패처럼 빈 이유가 오류일 때 */
  danger: "text-danger",
} as const;

interface Props {
  children: React.ReactNode;
  size?: keyof typeof SIZE_CLASS;
  tone?: keyof typeof TONE_CLASS;
  className?: string;
}

/**
 * 중앙정렬 한 줄 안내문 — 빈 목록·로딩 중·불러오기 실패 문구.
 *
 * 아이콘·부제가 있는 큰 빈 상태는 `@shared/ui/table` 의 `TableEmptyState` 를 쓴다.
 * 이쪽은 패널 안 좁은 슬롯용이라 `<p>` 한 줄이다.
 */
export const EmptyText = ({ children, size = "md", tone = "muted", className }: Props) => (
  <p className={cn("text-center text-body-3", SIZE_CLASS[size], TONE_CLASS[tone], className)}>{children}</p>
);
