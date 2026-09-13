import { Calendar } from "lucide-react";

import { DATE_RANGE_PRESET, type DateRangePreset } from "@shared/lib";
import { DATE_RANGE_PRESET_LABEL } from "@shared/config";
import { Button } from "@shared/ui/buttons";
import { DateRangePicker, FilterPopover, type DateRange } from "@shared/ui/form";

interface Props {
  range: DateRange;
  preset: DateRangePreset | null;
  activeCount: number;
  onPresetSelect: (preset: DateRangePreset) => void;
  onRangeChange: (range: DateRange | undefined) => void;
  onApply: () => void;
  onReset: () => void;
  onOpen: () => void;
}

/**
 * 측정계획 조회 기간 필터.
 *
 * 기본값은 오늘 하루이며, 자주 쓰는 구간은 프리셋 칩으로, 그 밖의 구간은 달력으로 고른다.
 * 값은 "적용"을 눌러야 목록에 반영된다.
 */
export const ScheduleFilterPopover = ({
  range,
  preset,
  activeCount,
  onPresetSelect,
  onRangeChange,
  onApply,
  onReset,
  onOpen,
}: Props) => (
  <FilterPopover
    icon={Calendar}
    title="측정일 기간"
    ariaLabel="측정일 기간 필터"
    activeCount={activeCount}
    onApply={onApply}
    onReset={onReset}
    onOpen={onOpen}
  >
    <div className="flex flex-wrap gap-1.5">
      {DATE_RANGE_PRESET.map((option) => (
        <Button
          key={option}
          size="sm"
          variant={preset === option ? "selected" : "outline"}
          aria-pressed={preset === option}
          onClick={() => onPresetSelect(option)}
        >
          {DATE_RANGE_PRESET_LABEL[option]}
        </Button>
      ))}
    </div>

    <DateRangePicker inline value={range} onChange={onRangeChange} />
  </FilterPopover>
);
