import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * 공통 카드 패널 래퍼.
 * 테이블/폼/차트 등을 감싸는 반복 스타일(면·코너)을 통일한다.
 * 패딩·테두리·그림자는 호출부가 className 으로 얹는다(기본값은 `bg-surface rounded-panel overflow-hidden` 뿐).
 */
export const Panel = ({ className, children, ...props }: Props) => (
  <div
    className={cn(
      "bg-surface rounded-panel overflow-hidden",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
