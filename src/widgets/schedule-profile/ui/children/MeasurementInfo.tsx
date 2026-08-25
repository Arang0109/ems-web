import { useMemo, useState } from "react";
import { SquarePen } from "lucide-react";

import type { ScheduleSnapshot } from "@entities/schedule";
import type { StackPollutantListItem } from "@entities/stack-pollutant";
import { UpdateScheduleClientForm } from "@features/update-schedule-client";
import { UpdateScheduleStackForm } from "@features/update-schedule-stack";
import { UpdateScheduleItemsForm } from "@features/update-schedule-items";
import { UpdateScheduleItemForm } from "@features/update-schedule-item";
import { UpdateScheduleBasicInfoForm } from "@features/update-schedule-basic-info";
import { formatBusinessNumber } from "@shared/lib";
import { MEASUREMENT_TYPE_LABEL } from "@shared/config";
import { SectionAccordion } from "@shared/ui/accordion";
import { IconButton } from "@shared/ui/buttons";
import { DetailGrid, DetailRow } from "@shared/ui/form";
import { useRemountKey } from "@shared/model";

import {
  value, fieldLabel, gradeLabel, shapeLabel, orientationLabel, describeDimension,
  groupPollutantsByCycle,
} from "../../model/mapper";
import { MeasurementItems } from "./MeasurementItems";

interface Props {
  scheduleId: number | null;
  snapshot: ScheduleSnapshot | null;
  stackPollutants: StackPollutantListItem[];
  editable: boolean;
  onRefetch: () => void;
}

export const MeasurementInfo = ({
  scheduleId, snapshot, stackPollutants, editable, onRefetch,
}: Props) => {
  // 카드마다 고치는 대상이 다르므로(측정항목·측정시설·의뢰기관) 수정 진입점도 카드별로 둔다.
  // 서버의 스냅샷 병합이 전달하지 않은 필드를 유지하므로 세 폼이 서로를 덮어쓰지 않는다.
  const [basicInfoEditOpen, setBasicInfoEditOpen] = useState(false);
  const [itemsEditOpen, setItemsEditOpen] = useState(false);
  const [stackEditOpen, setStackEditOpen] = useState(false);
  const [clientEditOpen, setClientEditOpen] = useState(false);

  // 정정할 측정항목은 물질 id 로 들고 있다가 스냅샷에서 되찾는다 — 스냅샷이 갱신되면
  // 폼도 새 값으로 리마운트되도록 항목 객체를 그대로 보관하지 않는다.
  const [editingPollutantId, setEditingPollutantId] = useState<number | null>(null);

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const basicInfoEditFormKey = useRemountKey(basicInfoEditOpen);
  const itemsEditFormKey = useRemountKey(itemsEditOpen);
  const stackEditFormKey = useRemountKey(stackEditOpen);
  const clientEditFormKey = useRemountKey(clientEditOpen);

  // 기준산소농도는 항목이 아니라 측정시설이 가진 값이라 칩 조립에 따로 넘긴다.
  const standardOxygen = snapshot?.client.workplace.stack.standardOxygen ?? null;

  const groups = useMemo(
    () => groupPollutantsByCycle(snapshot?.items ?? [], stackPollutants, standardOxygen),
    [snapshot?.items, stackPollutants, standardOxygen],
  );

  if (!snapshot) {
    return <p className="py-8 text-center text-body-2 text-muted-ink">측정정보가 없습니다.</p>;
  }

  const { basicInfo, team, client } = snapshot;
  const workplace = client.workplace;
  const stack = workplace.stack;
  const canEdit = editable && scheduleId !== null;

  const editAction = (label: string, onClick: () => void) =>
    canEdit ? (
      <IconButton
        icon={<SquarePen size={19} />}
        label={label}
        variant="ghost"
        size="icon-sm"
        onClick={onClick}
      />
    ) : undefined;

  // 정정 대상은 스냅샷에서 되찾는다 — 원장 id 는 원장 목록에서 찾아야 정확하다
  // (스냅샷의 stackPollutantId 는 측정 시점 값이라 그 뒤 삭제됐으면 가리키는 대상이 없다).
  const editingItem = snapshot.items.find((item) => item.pollutantId === editingPollutantId) ?? null;
  const editingStackPollutantId =
    stackPollutants.find((row) => row.pollutant.id === editingPollutantId)?.id ?? null;

  return (
    <div className="space-y-4">
      <SectionAccordion
        title="사전 정보"
        action={editAction("사전 정보 수정", () => setBasicInfoEditOpen(true))}
        defaultOpen={true}
      >
        <DetailGrid>
          <DetailRow label="관리번호" value={value(basicInfo.referenceNumber)} />
          {/* sampledAt은 LocalDate("yyyy-MM-dd") — Date 파싱 없이 원문 표시 */}
          <DetailRow label="측정일자" value={value(basicInfo.sampledAt)} />
          <DetailRow label="측정분야" value={fieldLabel(basicInfo.measurementField)} />
          <DetailRow
            label="측정용도"
            value={basicInfo.schedulePurpose
              ? (MEASUREMENT_TYPE_LABEL[basicInfo.schedulePurpose] ?? basicInfo.schedulePurpose)
              : "-"}
          />
          <DetailRow label="측정팀" value={value(team.teamName)} />
        </DetailGrid>
      </SectionAccordion>

      <SectionAccordion
        title="측정항목"
        action={editAction("측정항목 수정", () => setItemsEditOpen(true))}
        defaultOpen
      >
        <MeasurementItems
          groups={groups}
          onEditItem={canEdit ? setEditingPollutantId : undefined}
        />
      </SectionAccordion>

      <SectionAccordion
        title="측정시설 정보"
        action={editAction("측정시설 정보 수정", () => setStackEditOpen(true))}
      >
        <DetailGrid>
          <DetailRow label="측정시설" value={value(stack.name)} />
          <DetailRow label="SEMS 번호" value={value(stack.semsNumber)} />
          <DetailRow label="측정시설 종별" value={gradeLabel(stack.grade)} />
          <DetailRow label="주요 생산품" value={value(stack.mainProduct)} />
          <DetailRow label="방향" value={orientationLabel(stack.orientation)} />
          <DetailRow label="형태" value={shapeLabel(stack.shape)} />
          <DetailRow
            label="지름 / 크기"
            value={describeDimension(stack.shape, stack.horizontalLength, stack.verticalLength)}
          />
          <DetailRow label="측정공 높이 (m)" value={value(stack.height)} />
          <DetailRow label="기준산소농도 (%)" value={value(stack.standardOxygen)} />
        </DetailGrid>
      </SectionAccordion>

      <SectionAccordion
        title="의뢰기관 정보"
        action={editAction("의뢰기관 정보 수정", () => setClientEditOpen(true))}
      >
        <DetailGrid>
          <DetailRow label="의뢰기관" value={value(client.name)} />
          <DetailRow label="사업장" value={value(workplace.name)} />
          <DetailRow
            label="사업자번호"
            value={client.bizNumber ? formatBusinessNumber(client.bizNumber) : "-"}
          />
          {/* 주소는 한 열에 담기지 않아 줄바꿈으로 격자를 깨뜨리므로 데스크탑에서 전 열을 쓴다 */}
          <DetailRow
            label="사업장주소"
            span="full"
            value={value(`${workplace.roadAddress} ${workplace.detailAddress}`.trim())}
          />
          {/* 담당자는 측정계획마다 달라지므로 의뢰기관 스냅샷이 아니라 basicInfo가 보유한다.
              수정도 이 폼이 아니라 기본정보(PATCH /basic-info) 소관이다. */}
          <DetailRow label="배출시설 관리자" value={value(basicInfo.facilityManager)} />
          <DetailRow label="시료채취 입회자" value={value(basicInfo.samplingWitness)} />
          <DetailRow label="업종" value={value(workplace.businessCategory)} />
          <DetailRow label="사업장 종별" value={gradeLabel(workplace.grade)} />
        </DetailGrid>
      </SectionAccordion>

      {/* 열 때마다, 그리고 스냅샷이 갱신되면 key가 바뀌어 폼이 새 값으로 리마운트된다. */}
      {canEdit && (
        <>
          <UpdateScheduleBasicInfoForm
            key={`basic-${basicInfoEditFormKey}-${basicInfo.referenceNumber}-${basicInfo.sampledAt}-${basicInfo.schedulePurpose}`}
            scheduleId={scheduleId}
            basicInfo={basicInfo}
            tenant={snapshot.tenant ?? null}
            open={basicInfoEditOpen}
            onOpenChange={setBasicInfoEditOpen}
            onSuccess={onRefetch}
          />

          <UpdateScheduleItemsForm
            key={`items-${itemsEditFormKey}-${snapshot.items.map((item) => item.pollutantId).join(",")}`}
            scheduleId={scheduleId}
            stackPollutants={stackPollutants}
            items={snapshot.items}
            open={itemsEditOpen}
            onOpenChange={setItemsEditOpen}
            onSuccess={onRefetch}
          />

          <UpdateScheduleStackForm
            key={`stack-${stackEditFormKey}-${stack.stackId}-${stack.name}-${stack.height}-${stack.horizontalLength}-${stack.standardOxygen}`}
            scheduleId={scheduleId}
            stack={stack}
            open={stackEditOpen}
            onOpenChange={setStackEditOpen}
            onSuccess={onRefetch}
          />

          <UpdateScheduleClientForm
            key={`client-${clientEditFormKey}-${client.clientId}-${client.name}-${workplace.name}`}
            scheduleId={scheduleId}
            client={client}
            open={clientEditOpen}
            onOpenChange={setClientEditOpen}
            onSuccess={onRefetch}
          />

          {/* 정정 대상이 정해졌을 때만 마운트하므로, 닫으면 폼 상태가 함께 사라진다. */}
          {editingItem && (
            <UpdateScheduleItemForm
              key={`item-${editingItem.pollutantId}-${editingItem.cycle}-${editingItem.allowance}-${editingItem.oxygenApplicable}`}
              scheduleId={scheduleId}
              item={editingItem}
              stackPollutantId={editingStackPollutantId}
              standardOxygen={stack.standardOxygen}
              open={editingPollutantId !== null}
              onOpenChange={(open) => { if (!open) setEditingPollutantId(null); }}
              onSuccess={onRefetch}
            />
          )}
        </>
      )}
    </div>
  );
};
