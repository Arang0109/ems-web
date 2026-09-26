import { useState } from "react";
import { Clock } from "lucide-react";

import { Badge } from "@shared/ui/badges";
import { Button } from "@shared/ui/buttons";
import { Popover } from "@shared/ui/popover";
import { Tabs } from "@shared/ui/tabs";

import { ACTION_TILE_CLASS, ACTION_TILE_ICON_CLASS } from "../action-bar";

import type { SamplingTimeline } from "../../model/derived/sampling-timeline";
import type { TemperatureTables } from "../../model/derived/temperature-table";
import { SamplingTimelineView } from "./SamplingTimelineView";
import { TemperatureTableView } from "./TemperatureTableView";

interface Props {
  timeline: SamplingTimeline;
  temperatures: TemperatureTables;
}

/**
 * 시간 타임라인 — 흩어진 시각 입력을 한 축에 올려 앞뒤가 맞는지 확인한다.
 * 온도 탭은 섹션마다 흩어진 온도를 구간 시각과 함께 모아 "그 시각에 온도가 어땠나"를 대조한다.
 *
 * 트리거의 개수 배지가 이 기능의 핵심이다. 저장을 막지 않는 대신, 팝오버를 열지 않아도
 * 문제 유무가 보이게 해서 경고가 조용히 묻히지 않도록 한다. (배지는 시각 판정만 센다)
 *
 * 하단 고정 액션바에 놓이므로 위로 열린다 — 모바일에서 엄지 근처라 전체화면 모달보다 낫다.
 */
export const SamplingTimelinePopover = ({ timeline, temperatures }: Props) => {
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
      content={
        // 팝오버가 이미 표면이므로 탭 본문에 카드 셸을 씌우지 않는다.
        <Tabs
          contentPanel={false}
          options={[
            { value: "time", label: "시각", content: <SamplingTimelineView timeline={timeline} /> },
            {
              value: "temperature",
              label: "온도",
              content: <TemperatureTableView temperatures={temperatures} />,
            },
          ]}
        />
      }
    >
      <Button type="button" variant="soft" className={ACTION_TILE_CLASS}>
        <Clock className={ACTION_TILE_ICON_CLASS} />
        타임라인
        {/* 모바일 타일은 두 줄이라 배지를 모서리에 띄운다 */}
        {issueCount > 0 && (
          <Badge
            tone={worstLevel === "danger" ? "danger" : "warning"}
            className="absolute -top-1.5 -right-1 md:static"
          >
            {issueCount}
          </Badge>
        )}
      </Button>
    </Popover>
  );
};
