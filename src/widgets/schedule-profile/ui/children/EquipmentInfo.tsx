import { useMemo, useState } from "react";
import { SquarePen } from "lucide-react";

import type { EquipmentSnapshot, TeamSnapshot } from "@entities/schedule";
import { UpdateScheduleEquipmentsForm } from "@features/update-schedule-equipments";
import { EQUIP_TYPE_LABEL, EQUIP_TYPE_DESCRIPTION } from "@shared/config";
import { SectionAccordion } from "@shared/ui/accordion";
import { Badge } from "@shared/ui/badges";
import { IconButton } from "@shared/ui/buttons";
import { DetailGrid, DetailRow } from "@shared/ui/form";
import { useRemountKey } from "@shared/model";

import { value, describeEquipmentSpec, sortEquipmentsByType } from "../../model/mapper";
import type { EquipmentSpecItem } from "../../model/types";

interface Props {
  scheduleId: number | null;
  team: TeamSnapshot;
  equipments: EquipmentSnapshot[];
  editable: boolean;
  onRefetch: () => void;
}

/** 장비 카드의 DOM id — 스크롤 이동·딥링크 앵커 */
const cardDomId = (equipmentId: string): string => `equipment-card-${equipmentId}`;

const SpecValue = ({ item }: { item: EquipmentSpecItem }) =>
  "chips" in item ? (
    // 정렬은 DetailRow 의 뷰포트 분기(모바일 우측 / 데스크탑 좌측)를 그대로 따라간다.
    <span className="flex flex-wrap justify-end gap-1 md:justify-start">
      {item.chips.length === 0 ? (
        "-"
      ) : (
        item.chips.map((chip) => (
          <Badge key={chip} tone="brand">
            {chip}
          </Badge>
        ))
      )}
    </span>
  ) : (
    <>{item.value}</>
  );

export const EquipmentInfo = ({ scheduleId, team, equipments, editable, onRefetch }: Props) => {
  const [editOpen, setEditOpen] = useState(false);

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const editFormKey = useRemountKey(editOpen);
  const canEdit = editable && scheduleId !== null;

  const sorted = useMemo(() => sortEquipmentsByType(equipments), [equipments]);

  // 현장에서 한눈에 확인하는 화면이라 모든 카드를 펼친 상태로 시작한다.
  const [openedIds, setOpenedIds] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-4">
      {/* 장비가 없어도 배정 버튼은 보여야 하므로 조기 반환하지 않는다 */}
      {canEdit && (
        <div className="sticky top-0 z-10 flex items-center justify-end gap-2 bg-canvas py-2">
          <IconButton
            icon={<SquarePen size={19} />}
            label="장비 변경"
            variant="outline"
            onClick={() => setEditOpen(true)}
          />
        </div>
      )}

      {sorted.length === 0 && (
        <p className="py-8 text-center text-body-2 text-muted-ink">등록된 측정장비가 없습니다.</p>
      )}

      {sorted.map((equip) => (
        <SectionAccordion
          key={equip.equipmentId}
          id={cardDomId(equip.equipmentId)}
          title={EQUIP_TYPE_LABEL[equip.type] ?? equip.type}
          subtitle={EQUIP_TYPE_DESCRIPTION[equip.type]}
          open={openedIds[equip.equipmentId]}
          onOpenChange={(open) => {
            setOpenedIds((prev) => ({ ...prev, [equip.equipmentId]: open }));
          }}
        >
          {/* 데스크탑 DetailRow 는 라벨(7rem)+값을 가로로 놓으므로 기존 5열은 값이 들어갈 폭이 없다 */}
          <DetailGrid>
            <DetailRow label="별칭" value={value(equip.alias)} />
            {describeEquipmentSpec(equip).map((item) => (
              <DetailRow key={item.label} label={item.label} value={<SpecValue item={item} />} />
            ))}
          </DetailGrid>
        </SectionAccordion>
      ))}

      {canEdit && (
        // 열 때마다, 그리고 배정이 바뀌면 key가 바뀌어 폼이 새 값으로 리마운트된다.
        <UpdateScheduleEquipmentsForm
          key={`${editFormKey}-${team.particleSamplerId}-${team.gasSamplerId}-${team.pitotTubeId}-${team.nozzleId}`}
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
