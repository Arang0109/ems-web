import { cn } from "@/lib/utils";

import { Panel } from "@shared/ui/cards";

import { Skeleton } from "./Skeleton";

interface Props {
  /** 제목·부제 두 줄 자리표시. 헤더 없는 패널이면 false */
  withHeader?: boolean;
  /** 본문 블록 높이 (기본 `h-40`) */
  bodyClassName?: string;
  className?: string;
}

/**
 * 패널 하나가 로딩 중일 때의 자리표시.
 * 실제 패널과 같은 면·코너·테두리를 써서 로딩 전후로 레이아웃이 튀지 않게 한다.
 */
export const SkeletonPanel = ({
  withHeader = true,
  bodyClassName = "h-40",
  className,
}: Props) => (
  <Panel className={cn("p-4 space-y-3 shadow-panel ring-1 ring-rule", className)}>
    {withHeader && (
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    )}
    <Skeleton className={bodyClassName} />
  </Panel>
);
