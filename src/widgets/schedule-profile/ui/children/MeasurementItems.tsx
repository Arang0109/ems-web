import { SquarePen } from "lucide-react";

import { IconButton } from "@shared/ui/buttons";
import { ItemTile, ItemTileGrid, ItemTileGroup } from "@shared/ui/cards";

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
 * 오염물질 타일 — 이름 + 허용기준 + 산소보정.
 * 이번 계획에 포함된 항목(selected)은 브랜드 톤, 나머지는 한 단 물러선 중립 톤이다.
 *
 * 산소보정은 적용하는 항목에만 표시한다 — 대부분의 항목이 미적용이라
 * "미적용"까지 적으면 칩마다 의미 없는 줄이 하나씩 늘어난다.
 *
 * 정정 버튼은 이번 계획에 포함된 항목에만 붙는다. 포함되지 않은 항목은 이 계획의
 * 측정 조건이라 할 것이 없어(스냅샷에 없다) 고칠 대상 자체가 없다.
 */
const PollutantTile = ({
  item, selected, onEdit,
}: { item: PollutantChipItem; selected: boolean; onEdit?: () => void }) => (
  <ItemTile
    title={item.name}
    tone={selected ? "brand" : "neutral"}
    description={
      <p>
        허용기준:{item.allowance}
        {item.oxygenApplicable && <span> ({item.standardOxygen})</span>}
      </p>
    }
    actions={onEdit && (
      <IconButton
        icon={<SquarePen size={19} />}
        label={`${item.name} 측정조건 정정`}
        variant="ghost"
        size="icon-sm"
        onClick={onEdit}
      />
    )}
  />
);

export const MeasurementItems = ({ groups, onEditItem }: Props) => {
  if (groups.length === 0) {
    return <p className="py-2 text-body-2 text-muted-ink">등록된 측정항목이 없습니다.</p>;
  }

  return (
    <div>
      {groups.map((group) => (
        <ItemTileGroup
          key={group.cycle}
          title={group.label}
          count={group.current.length + group.others.length}
        >
          {group.current.length > 0 && (
            <ItemTileGrid label="현재 측정 항목">
              {group.current.map((item) => (
                <PollutantTile
                  key={item.key}
                  item={item}
                  selected
                  onEdit={onEditItem && (() => onEditItem(item.pollutantId))}
                />
              ))}
            </ItemTileGrid>
          )}
          {group.others.length > 0 && (
            <ItemTileGrid label="전체 측정 항목">
              {group.others.map((item) => (
                <PollutantTile key={item.key} item={item} selected={false} />
              ))}
            </ItemTileGrid>
          )}
        </ItemTileGroup>
      ))}
    </div>
  );
};
