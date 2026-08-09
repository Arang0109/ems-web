import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

/**
 * 중앙정렬 한 줄 안내문 — 빈 목록·로딩 중 문구.
 *
 * 아이콘·부제가 있는 큰 빈 상태는 `@shared/ui/table` 의 `TableEmptyState` 를 쓴다.
 * 이쪽은 패널 안 좁은 슬롯용이라 `<p>` 한 줄이다.
 */
export const EmptyText = ({ children, className }: Props) => (
  <p className={cn("py-8 text-center text-body-3 text-muted-ink", className)}>{children}</p>
);
