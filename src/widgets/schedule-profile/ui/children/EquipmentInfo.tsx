import { useState } from "react";
import { Pencil } from "lucide-react";

import type { EquipmentSnapshot, TeamSnapshot } from "@entities/schedule";
import { UpdateScheduleEquipmentsForm } from "@features/update-schedule-equipments";
import { EQUIP_TYPE_LABEL } from "@shared/config";
import { IconButton } from "@shared/ui/buttons";

import { value, describeEquipmentSpec } from "../../model/mapper";

interface Props {
  scheduleId: number | null;
  team: TeamSnapshot;
  equipments: EquipmentSnapshot[];
  editable: boolean;
  onRefetch: () => void;
}

const SpecItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-muted/40 rounded-xl px-4 py-3">
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground break-all">{value}</p>
  </div>
);

export const EquipmentInfo = ({ scheduleId, team, equipments, editable, onRefetch }: Props) => {
  const [editOpen, setEditOpen] = useState(false);
  const canEdit = editable && scheduleId !== null;

  return (
    <div className="space-y-5">
      {/* 장비가 없어도 배정 버튼은 보여야 하므로 조기 반환하지 않는다 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">측정장비</h3>
        {canEdit && (
          <IconButton
            icon={<Pencil size={12} />}
            label="장비 변경"
            size="xs"
            onClick={() => setEditOpen(true)}
          />
        )}
      </div>

      {equipments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">등록된 측정장비가 없습니다.</p>
      )}

      {equipments.map((equip) => (
        <div key={equip.equipmentId} className="rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {EQUIP_TYPE_LABEL[equip.type] ?? equip.type}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {value(equip.equipmentName || equip.modelName)}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SpecItem label="관리번호" value={value(equip.managementNumber)} />
            <SpecItem label="시리얼번호" value={value(equip.serialNumber)} />
            <SpecItem label="모델명" value={value(equip.modelName)} />
            <SpecItem label="제조사" value={value(equip.manufacturer)} />
            {describeEquipmentSpec(equip).map((spec) => (
              <SpecItem key={spec.label} label={spec.label} value={spec.value} />
            ))}
          </div>
        </div>
      ))}

      {canEdit && (
        // 배정이 바뀌면 key가 바뀌어 폼이 새 값으로 리마운트된다.
        <UpdateScheduleEquipmentsForm
          key={`${team.particleSamplerId}-${team.gasSamplerId}-${team.pitotTubeId}-${team.nozzleId}`}
          scheduleId={scheduleId}
          team={team}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={onRefetch}
        />
      )}
    </div>
  );
};
