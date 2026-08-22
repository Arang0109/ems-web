import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge, type BadgeTone } from "@shared/ui/badges";

interface Props {
  title: React.ReactNode;
  children: React.ReactNode;

  /** 섹션 바로가기·스크롤 이동의 앵커 */
  id?: string;
  /** 제목 아래 보조 설명 — 헤더에서 제목과 다른 행에 놓인다 */
  subtitle?: React.ReactNode;
  /** 제목 왼쪽 액션(수정 버튼 등) — 접기 토글과 별개의 인터랙션 */
  action?: React.ReactNode;
  /** 제목 아래 안내문 */
  description?: React.ReactNode;
  /** 헤더 우측 진행도 배지 — 입력 완료 수 / 필수 항목 수 */
  progress?: { done: number; total: number };
  /** 진행도 배지의 톤 — 진행 정도에 따른 색은 호출부(도메인)가 정한다 */
  progressTone?: BadgeTone;
  /** 본문 하단 고정 영역 — 이전/다음 이동 버튼 등 */
  footer?: React.ReactNode;
  /**
   * 화면 밖에서 방금 갱신된 섹션임을 알리는 배지 문구.
   * 접혀 있어도 눈에 띄도록 카드 테두리도 함께 강조한다. 오류가 아니라 안내이므로 brand 톤을 쓴다.
   */
  highlightLabel?: string;

  /** 비제어 초기 상태 */
  defaultOpen?: boolean;
  /** 제어 모드 — 지정하면 open 상태를 부모가 소유한다 */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  className?: string;
}

/**
 * 피그마 "측정 데이터 입력" 화면의 섹션 카드.
 *
 * 카드 셸(surface + rule 링 + panel 코너 + panel 그림자) 안에
 * [제목 + 진행도 배지 + chevron] 헤더와 접이식 본문을 가진다.
 * open/onOpenChange 를 넘기면 제어 모드로 동작해 부모가 섹션 간 이동을 제어할 수 있다.
 */
export const SectionAccordion = ({
  title,
  children,
  id,
  subtitle,
  action,
  description,
  progress,
  progressTone = "brand",
  footer,
  highlightLabel,
  defaultOpen = false,
  open,
  onOpenChange,
  className,
}: Props) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;

  const toggle = () => {
    if (!isControlled) setUncontrolledOpen((v) => !v);
    onOpenChange?.(!isOpen);
  };

  return (
    <section
      id={id}
      className={cn(
        "overflow-hidden rounded-panel bg-surface shadow-panel ring-1 ring-rule",
        "scroll-mt-4",
        highlightLabel && "ring-2 ring-brand-primary",
        className,
      )}
    >
      {/* action 은 토글 버튼 밖에 둔다 — 버튼 안에 버튼을 넣으면 유효하지 않은 마크업이 된다 */}
      <div className="flex items-center gap-2 p-4 md:p-5">
        {action}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
        >
          {/* 제목/보조 설명은 세로로 쌓는다 — 한 줄에 두면 좁은 폭에서 제목이 먼저 잘린다.
              제목에 shrink-0 를 주면 긴 제목이 헤더의 min-content 를 밀어올려
              좁은 화면에서 카드 자체가 안 줄어든다 */}
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="flex min-w-0 items-center gap-2">
              <span className="min-w-0 truncate text-h3 text-ink">{title}</span>
              {progress && (
                <Badge tone={progressTone} className="shrink-0">
                  {progress.done}/{progress.total}
                </Badge>
              )}
              {highlightLabel && (
                <Badge tone="brand" className="shrink-0">
                  {highlightLabel}
                </Badge>
              )}
            </span>
            {subtitle && (
              <span className="min-w-0 truncate text-caption text-muted-ink">{subtitle}</span>
            )}
          </span>
          <ChevronDown
            size={19}
            aria-hidden
            className={cn(
              "shrink-0 text-ink transition-transform duration-300",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-rule px-4 pt-3 pb-4 md:px-5 md:pt-4 md:pb-5">
            {description && <p className="text-body-3 text-muted-ink">{description}</p>}
            {children}
            {footer}
          </div>
        </div>
      </div>
    </section>
  );
};
