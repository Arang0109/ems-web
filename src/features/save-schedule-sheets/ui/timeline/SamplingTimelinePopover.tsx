import { useState } from "react";
import { Clock } from "lucide-react";

import { Badge } from "@shared/ui/badges";
import { Button } from "@shared/ui/buttons";
import { Popover } from "@shared/ui/popover";

import type { SamplingTimeline } from "../../model/sampling-timeline";
import { SamplingTimelineView } from "./SamplingTimelineView";

interface Props {
  timeline: SamplingTimeline;
}

/**
 * 시간 타임라인 — 흩어진 시각 입력을 한 축에 올려 앞뒤가 맞는지 확인한다.
 *
 * 트리거의 개수 배지가 이 기능의 핵심이다. 저장을 막지 않는 대신, 팝오버를 열지 않아도
 * 문제 유무가 보이게 해서 경고가 조용히 묻히지 않도록 한다.
 *
 * 하단 고정 액션바에 놓이므로 위로 열린다 — 모바일에서 엄지 근처라 전체화면 모달보다 낫다.
 */
export const SamplingTimelinePopover = ({ timeline }: Props) => {
  const [open, setOpen] = useState(false);

  const { issueCount, worstLevel } = timeline;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="top"
      align="end"
      title="시간 타임라인"
      // 시각을 옮겨 적을 수 있도록 전역 user-select 금지를 이 표면에서만 푼다.
      className="w-[min(92vw,42rem)] max-h-[70vh] overflow-y-auto select-text"
      content={<SamplingTimelineView timeline={timeline} />}
    >
      <Button type="button" variant="soft" startIcon={Clock}>
        타임라인
        {issueCount > 0 && (
          <Badge tone={worstLevel === "danger" ? "danger" : "warning"}>{issueCount}</Badge>
        )}
      </Button>
    </Popover>
  );
};
