import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type CalloutTone = "neutral" | "info" | "warning" | "danger";

const TONE_CLASS: Record<CalloutTone, { box: string; icon: string }> = {
  /** 제안·안내 — 해도 되고 안 해도 되는 일 */
  neutral: { box: "border-rule bg-surface text-ink-soft", icon: "text-muted-ink" },
  /** 참고 — 불러온 값·미등록 항목처럼 확인하면 좋은 것 */
  info: { box: "border-info/40 bg-info-soft text-info-ink", icon: "text-info" },
  /** 확인 필요 */
  warning: { box: "border-warning/40 bg-warning-soft text-warning-ink", icon: "text-warning-ink" },
  /** 오류·누락 — 그대로 두면 결과가 틀어진다 */
  danger: { box: "border-danger/40 bg-danger-soft text-danger", icon: "text-danger" },
};

interface Props extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: CalloutTone;
  icon?: LucideIcon;
  /**
   * 굵은 첫 줄. 있으면 아이콘이 제목 옆에 붙고 `children` 은 그 아래 본문이 된다
   * (목록 등 여러 줄 내용). 없으면 아이콘과 `children` 이 한 줄로 흐른다.
   */
  title?: React.ReactNode;
  /** 오른쪽 버튼 자리 — 좁으면 아래로 내려간다 */
  action?: React.ReactNode;
}

/**
 * 톤 배너 — 화면 안에서 "지금 알아야 할 것" 한 덩어리를 면으로 띄운다.
 *
 * 토스트는 사라지고 칸 아래 문구는 한 칸에 묶이는데, 이것은 **섹션·페이지 단위** 안내다.
 * 기록지 편집기·대시보드 등 다섯 곳이 반경·테두리 투명도·여백을 제각각 적던 것을 모았다.
 * 색만으로 뜻을 전하지 않도록 아이콘을 함께 두는 것을 권장한다.
 */
export const Callout = ({ tone = "neutral", icon: Icon, title, action, className, children, ...props }: Props) => {
  const toneClass = TONE_CLASS[tone];
  const iconNode = Icon && <Icon size={15} aria-hidden className={cn("mt-0.5 shrink-0", toneClass.icon)} />;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 rounded-icon-tile border px-3 py-2.5 text-body-3",
        toneClass.box,
        className,
      )}
      {...props}
    >
      {title ? (
        <div className="min-w-0 flex-1 space-y-2">
          <p className="flex items-start gap-1.5 text-body-4">
            {iconNode}
            {title}
          </p>
          {children}
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 items-start gap-1.5">
          {iconNode}
          <div className="min-w-0">{children}</div>
        </div>
      )}
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  );
};
