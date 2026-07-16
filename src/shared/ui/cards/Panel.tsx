import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * 공통 카드 패널 래퍼.
 * 테이블/폼/차트 등을 감싸는 반복 스타일(bg-card rounded-2xl shadow-sm border)을 통일한다.
 * 패딩·overflow 등은 className으로 덮어쓸 수 있다(기본값: p-5 overflow-hidden).
 */
export const Panel = ({ className, children, ...props }: Props) => (
  <div
    className={cn(
      "bg-card rounded-2xl p-5 shadow-sm border border-border overflow-hidden",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
