import { useMemo, useState } from "react";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import { Button, IconButton } from "@shared/ui/buttons";
import { EmptyText } from "@shared/ui/feedback";
import { useRemountKey } from "@shared/model";
import { ItemTile, ItemTileGrid, ItemTileGroup } from "@shared/ui/cards";

import type { StackPollutantListItem } from "@entities/stack-pollutant";
import { RegisterStackPollutantForm } from "@features/register-stack-pollutant";
import { UpdateStackPollutantForm, useDeleteStackPollutant } from "@features/update-stack-pollutant";

import { groupMeasurementsByCycle } from "../../model/mapper";
import type { MeasurementProfile } from "../../model/types";

interface Props {
  stackId: number | null;
  /** 측정시설의 기준산소농도(%) — null 이면 항목별 산소보정을 보여줄 이유가 없다 */
  standardOxygen: number | null;
  measurements: MeasurementProfile[];
  /** 수정 폼의 초기값은 표시 문자열이 아니라 원본 값이어야 하므로 원장 목록을 함께 받는다 */
  stackPollutants: StackPollutantListItem[];
  onRefetch?: () => void;
}

/**
 * 측정항목 타일 — 이름(국문·영문) + 허용기준 + 산소보정.
 *
 * 산소보정은 적용하는 항목에만 표시한다 — 대부분의 항목이 미적용이라
 * "미적용"까지 적으면 칩마다 의미 없는 줄이 하나씩 늘어난다.
 */
const MeasurementTile = ({
  item, standardOxygen, onEdit, onDelete,
}: {
  item: MeasurementProfile;
  standardOxygen: number | null;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <ItemTile
    title={item.nameKr}
    description={
      <>
        <p>{item.nameEn}</p>
        <p>
          허용기준:{item.allowance}
          {item.oxygenApplicable && standardOxygen !== null && <span> ({standardOxygen}%)</span>}
        </p>
      </>
    }
    actions={
      <>
        <IconButton
          icon={<SquarePen size={19} />}
          label={`${item.nameKr} 수정`}
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
        />
        <IconButton
          icon={<Trash2 size={19} />}
          label={`${item.nameKr} 삭제`}
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
        />
      </>
    }
  />
);

export const MeasurementInfo = ({
  stackId, standardOxygen, measurements, stackPollutants, onRefetch,
}: Props) => {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerOpen);
  const updateFormKey = useRemountKey(updateOpen);

  const { handleDelete } = useDeleteStackPollutant({ onSuccess: () => onRefetch?.() });

  const groups = useMemo(() => groupMeasurementsByCycle(measurements), [measurements]);

  const findItem = (id: number) => stackPollutants.find((item) => item.id === id) ?? null;
  const selectedItem = selectedId === null ? null : findItem(selectedId);

  const handleEditClick = (id: number) => {
    setSelectedId(id);
    setUpdateOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    const item = findItem(id);
    if (item) handleDelete(item);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-h3 text-ink">측정항목</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRegisterOpen(true)}
          disabled={!stackId}
        >
          <Plus size={14} className="mr-1" />
          측정항목 추가
        </Button>
      </div>

      {groups.length === 0 ? (
        <EmptyText>등록된 측정항목이 없습니다.</EmptyText>
      ) : (
        <div>
          {groups.map((group) => (
            <ItemTileGroup key={group.cycle} title={group.label} count={group.items.length}>
              <ItemTileGrid>
                {group.items.map((item) => (
                  <MeasurementTile
                    key={item.id}
                    item={item}
                    standardOxygen={standardOxygen}
                    onEdit={() => handleEditClick(item.id)}
                    onDelete={() => handleDeleteClick(item.id)}
                  />
                ))}
              </ItemTileGrid>
            </ItemTileGroup>
          ))}
        </div>
      )}

      <RegisterStackPollutantForm
        key={`register-${registerFormKey}`}
        stackId={stackId}
        standardOxygen={standardOxygen}
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={onRefetch}
      />

      {/* 다른 항목을 고르거나 원장이 갱신되면 key 가 바뀌어 폼이 새 값으로 리마운트된다 */}
      <UpdateStackPollutantForm
        key={`update-${updateFormKey}-${selectedId}`}
        item={selectedItem}
        standardOxygen={standardOxygen}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onSuccess={onRefetch}
      />
    </div>
  );
};
