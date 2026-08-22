import { SquarePen } from "lucide-react";

import { cn } from "@/lib/utils";
import { IconButton } from "@shared/ui/buttons";

import type { PollutantChipItem, PollutantCycleGroup } from "../../model/types";

interface Props {
  groups: PollutantCycleGroup[];
  /**
   * 이번 계획에 포함된 항목의 측정조건 정정 진입점. 없으면 버튼을 그리지 않는다
   * (완료·취소된 계획이거나 아직 계획 id 를 모르는 경우).
   */
  onEditItem?: (pollutantId: number) => void;
}

/**
 * 오염물질 칩 — 이름 + 허용기준 + 산소보정.
 * 이번 계획에 포함된 항목(selected)은 Soft 면 + 브랜드 테두리로 구분한다.
 *
 * 산소보정은 적용하는 항목에만 표시한다 — 대부분의 항목이 미적용이라
 * "미적용"까지 적으면 칩마다 의미 없는 줄이 하나씩 늘어난다.
 *
 * 정정 버튼은 이번 계획에 포함된 항목에만 붙는다. 포함되지 않은 항목은 이 계획의
 * 측정 조건이라 할 것이 없어(스냅샷에 없다) 고칠 대상 자체가 없다.
 */
const PollutantChip = ({
  item, selected, onEdit,
}: { item: PollutantChipItem; selected: boolean; onEdit?: () => void }) => (
  <div
    className={cn(
      "flex items-start gap-2 rounded-panel border px-3 py-2",
      selected ? "border-brand-primary bg-brand-soft" : "border-rule-dark bg-surface",
    )}
  >
    <div className="min-w-0">
      <p className={cn("text-body-1", selected ? "text-brand-dark" : "text-ink-soft")}>{item.name}</p>
      <p className="text-caption text-brand-dark">
        허용기준 : {item.allowance}
        {item.oxygenApplicable && (
          <span className="text-brand-dark">({item.standardOxygen})</span>
        )}
      </p>
    </div>

    {onEdit && (
      <IconButton
        icon={<SquarePen size={15} />}
        label={`${item.name} 측정조건 정정`}
        variant="ghost"
        size="icon-sm"
        onClick={onEdit}
      />
    )}
  </div>
);

const ChipRow = ({
  label, items, selected, onEditItem,
}: {
  label: string;
  items: PollutantChipItem[];
  selected: boolean;
  onEditItem?: (pollutantId: number) => void;
}) => (
  <div className="space-y-2">
    <p className="text-label text-muted-ink">{label}</p>
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <PollutantChip
          key={item.key}
          item={item}
          selected={selected}
          onEdit={onEditItem && (() => onEditItem(item.pollutantId))}
        />
      ))}
    </div>
  </div>
);

/** 측정주기별 묶음 상자 — 헤더에 주기명과 건수, 본문에 현재/나머지 항목 칩 */
const CycleGroupBox = ({
  group, onEditItem,
}: { group: PollutantCycleGroup; onEditItem?: (pollutantId: number) => void }) => (
  <div className="rounded-panel border border-rule bg-canvas p-3">
    <p className="border-b border-rule px-1 pb-3 text-body-4 text-ink">
      {group.label} : <span className="text-brand-dark">{group.current.length + group.others.length}개</span>
    </p>

    <div className="space-y-3 pt-2">
      {group.current.length > 0 && (
        <div className={cn(group.others.length > 0 && "border-b border-rule-dark pb-3")}>
          <ChipRow label="현재 측정 항목" items={group.current} selected onEditItem={onEditItem} />
        </div>
      )}
      {group.others.length > 0 && (
        <ChipRow label="전체 측정 항목" items={group.others} selected={false} />
      )}
    </div>
  </div>
);

export const MeasurementItems = ({ groups, onEditItem }: Props) => {
  if (groups.length === 0) {
    return <p className="py-2 text-body-2 text-muted-ink">등록된 측정항목이 없습니다.</p>;
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <CycleGroupBox key={group.cycle} group={group} onEditItem={onEditItem} />
      ))}
    </div>
  );
};
