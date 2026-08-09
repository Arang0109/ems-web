import { cn } from "@/lib/utils";

import type { PollutantChipItem, PollutantCycleGroup } from "../../model/types";

interface Props {
  groups: PollutantCycleGroup[];
}

/**
 * 오염물질 칩 — 이름 + 허용기준.
 * 이번 계획에 포함된 항목(selected)은 Soft 면 + 브랜드 테두리로 구분한다.
 */
const PollutantChip = ({ item, selected }: { item: PollutantChipItem; selected: boolean }) => (
  <div
    className={cn(
      "rounded-panel border px-3 py-2",
      selected ? "border-brand-primary bg-brand-soft" : "border-rule-dark bg-surface",
    )}
  >
    <p className={cn("text-body-1", selected ? "text-brand-dark" : "text-ink-soft")}>{item.name}</p>
    <p className="text-caption text-muted-ink">허용기준 : {item.allowance}</p>
  </div>
);

const ChipRow = ({
  label, items, selected,
}: { label: string; items: PollutantChipItem[]; selected: boolean }) => (
  <div className="space-y-2">
    <p className="text-label text-muted-ink">{label}</p>
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <PollutantChip key={item.key} item={item} selected={selected} />
      ))}
    </div>
  </div>
);

/** 측정주기별 묶음 상자 — 헤더에 주기명과 건수, 본문에 현재/나머지 항목 칩 */
const CycleGroupBox = ({ group }: { group: PollutantCycleGroup }) => (
  <div className="rounded-panel border border-rule bg-canvas p-3">
    <p className="border-b border-rule px-1 pb-3 text-body-4 text-ink">
      {group.label} : <span className="text-brand-dark">{group.current.length + group.others.length}개</span>
    </p>

    <div className="space-y-3 pt-2">
      {group.current.length > 0 && (
        <div className={cn(group.others.length > 0 && "border-b border-rule-dark pb-3")}>
          <ChipRow label="현재 측정 항목" items={group.current} selected />
        </div>
      )}
      {group.others.length > 0 && (
        <ChipRow label="전체 측정 항목" items={group.others} selected={false} />
      )}
    </div>
  </div>
);

export const MeasurementItems = ({ groups }: Props) => {
  if (groups.length === 0) {
    return <p className="py-2 text-body-2 text-muted-ink">등록된 측정항목이 없습니다.</p>;
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <CycleGroupBox key={group.cycle} group={group} />
      ))}
    </div>
  );
};
