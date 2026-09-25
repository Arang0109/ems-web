import { cn } from "@/lib/utils";

const VARIANT_CLASS = {
  /** 면·코너만 — 테두리·그림자는 호출부가 정한다 */
  plain: "bg-surface rounded-panel overflow-hidden",
  /** 캔버스 위에 떠 있는 섹션 카드 — 대시보드·아코디언·스켈레톤 */
  elevated: "bg-surface rounded-panel overflow-hidden shadow-panel ring-1 ring-rule",
  /** 그림자 없이 선만 — 나란히 붙은 패널(채팅 목록·대화방)이 서로 떠 보이지 않게 */
  outlined: "bg-surface rounded-panel overflow-hidden ring-1 ring-rule",
  /**
   * 패널 **안의** 묶음 상자 — 캔버스 면으로 한 단 내려앉힌다.
   * 안에 입력칸이 오므로 `overflow-hidden` 을 걸지 않는다(포커스 링이 잘린다).
   */
  inset: "rounded-panel border border-rule bg-canvas p-3",
} as const;

type PanelVariant = keyof typeof VARIANT_CLASS;

interface Props extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: PanelVariant;
  /** 문서 구조상 의미가 있을 때만 바꾼다 — 대시보드 보조 영역은 `aside` */
  as?: "div" | "section" | "aside";
}

/**
 * 공통 카드 패널 래퍼.
 * 테이블/폼/차트 등을 감싸는 반복 스타일(면·코너·테두리·그림자)을 `variant` 로 통일한다.
 * 패딩은 `inset` 만 기본으로 가진다 — 나머지는 내용(표·폼)이 스스로 여백을 가진다.
 */
export const Panel = ({ variant = "plain", as: Tag = "div", className, children, ...props }: Props) => (
  <Tag className={cn(VARIANT_CLASS[variant], className)} {...props}>
    {children}
  </Tag>
);
