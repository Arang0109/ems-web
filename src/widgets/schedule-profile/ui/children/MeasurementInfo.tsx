import React, { useMemo, useState } from "react";
import { Calendar, SquarePen } from "lucide-react";

import type { ScheduleDetail, ScheduleSnapshot } from "@entities/schedule";
import type { StackPollutantListItem } from "@entities/stack-pollutant";
import { UpdateScheduleClientForm } from "@features/update-schedule-client";
import { UpdateScheduleStackForm } from "@features/update-schedule-stack";
import { UpdateScheduleItemsForm } from "@features/update-schedule-items";
import { UpdateScheduleItemForm } from "@features/update-schedule-item";
import { UpdateScheduleBasicInfoForm } from "@features/update-schedule-basic-info";
import { displayValue, formatBusinessNumber } from "@shared/lib";
import { MEASUREMENT_TYPE_LABEL } from "@shared/config";
import { SectionAccordion } from "@shared/ui/accordion";
import { IconButton } from "@shared/ui/buttons";
import { SectionCard } from "@shared/ui/cards";
import { useIsMobile, useRemountKey } from "@shared/model";
import { EmptyText } from "@shared/ui/feedback";

import {
  fieldLabel, gradeLabel, shapeLabel, orientationLabel, describeDimension,
  groupPollutantsByCycle,
} from "../../model/mapper";

// 서버 계약은 자유 문자열이라 레이블맵에 없는 값이 올 수 있다 — 그때는 원문을 그대로 보인다.
const purposeLabel = (purpose: string | null): string => {
  if (!purpose) return "-";
  return MEASUREMENT_TYPE_LABEL[purpose as keyof typeof MEASUREMENT_TYPE_LABEL] ?? purpose;
};
import { MeasurementItems } from "./MeasurementItems";
import { HighlightBox, InfoRows } from "./InfoBlocks";

/**
 * 측정정보 카드 — 모바일은 접이식, 데스크탑은 펼친 카드.
 * 데스크탑 시안은 네 카드를 두 열에 한 번에 펼쳐 보여 주므로 접을 이유가 없고,
 * 모바일은 한 열로 길게 쌓이므로 접어서 훑을 수 있어야 한다.
 */
const InfoSection = ({
  title, action, children,
}: { title: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) => {
  const isMobile = useIsMobile();

  return isMobile ? (
    <SectionAccordion title={title} action={action} defaultOpen>
      {children}
    </SectionAccordion>
  ) : (
    <SectionCard title={title} action={action}>
      {children}
    </SectionCard>
  );
};

/** 사전 정보의 보조 값 타일 — 라벨 위·값 아래, Soft 면 */
const SoftTile = ({ label, value }: { label: string; value: string }) => (
  <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-icon-tile bg-brand-soft px-3 py-2">
    <span className="text-caption text-muted-ink">{label}</span>
    <span className="text-body-4 wrap-break-words text-ink">{value}</span>
  </div>
);

interface Props {
  scheduleId: number | null;
  /** 계획 메타(관리번호·채취일자·측정분야·측정용도) — 스냅샷이 아니라 응답 최상위가 진실의 원천이다. */
  schedule: ScheduleDetail | null;
  snapshot: ScheduleSnapshot | null;
  stackPollutants: StackPollutantListItem[];
  editable: boolean;
  onRefetch: () => void;
}

export const MeasurementInfo = ({
  scheduleId, schedule, snapshot, stackPollutants, editable, onRefetch,
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
    return <EmptyText>측정정보가 없습니다.</EmptyText>;
  }

  const { samplingData, team, client } = snapshot;
  const workplace = client.workplace;
  const stack = workplace.stack;
  const canEdit = editable && scheduleId !== null && schedule !== null;

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

  const totalItemCount = groups.reduce(
    (sum, group) => sum + group.current.length + group.others.length,
    0,
  );

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      {/* 왼쪽은 계획·시설·의뢰기관 메타, 오른쪽은 측정항목 — 좁은 화면에서는 한 열로 쌓인다 */}
      <div className="min-w-0 space-y-5">
        <InfoSection
          title="측정계획 사전 정보"
          action={editAction("사전 정보 수정", () => setBasicInfoEditOpen(true))}
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {/* 관리번호가 이 계획의 대표 식별자라 브랜드 막대로 앞세운다 */}
            <div className="flex items-stretch gap-4">
              <span aria-hidden className="w-1 shrink-0 rounded-full bg-brand-primary" />
              <div className="flex flex-wrap items-end gap-x-1.5 gap-y-1">
                <div className="flex flex-col gap-2">
                  <span className="text-label text-muted-ink">관리번호</span>
                  <span className="text-h3 text-ink">{displayValue(schedule?.referenceNumber)}</span>
                </div>
                <div className="flex items-center gap-2 pb-1">
                  <span className="flex items-center gap-1 text-label text-muted-ink">
                    <Calendar size={16} aria-hidden />
                    측정일
                  </span>
                  {/* sampledAt은 LocalDate("yyyy-MM-dd") — Date 파싱 없이 원문 표시 */}
                  <span className="text-body-4 text-ink-soft">{displayValue(schedule?.sampledAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex min-w-64 flex-1 gap-2">
              <SoftTile label="측정 분야" value={schedule ? fieldLabel(schedule.measurementField) : "-"} />
              <SoftTile label="측정 용도" value={purposeLabel(schedule?.schedulePurpose ?? null)} />
              <SoftTile label="측정 팀" value={displayValue(team.teamName)} />
            </div>
          </div>
        </InfoSection>

        <InfoSection
          title="측정시설 정보"
          action={editAction("측정시설 정보 수정", () => setStackEditOpen(true))}
        >
          <div className="space-y-2">
            <HighlightBox
              label="측정 시설"
              value={displayValue(stack.name)}
              aside={workplace.name || undefined}
            />
            <InfoRows
              rows={[
                [
                  { label: "SEMS 번호", value: displayValue(stack.semsNumber) },
                  { label: "측정시설 종별", value: gradeLabel(stack.grade) },
                  { label: "주요 생산품", value: displayValue(stack.mainProduct) },
                  { label: "방향", value: orientationLabel(stack.orientation) },
                ],
                [
                  { label: "형태", value: shapeLabel(stack.shape) },
                  {
                    label: "지름 / 크기",
                    value: describeDimension(stack.shape, stack.horizontalLength, stack.verticalLength),
                  },
                  { label: "측정공 높이 (m)", value: displayValue(stack.height) },
                  { label: "기준산소농도 (%)", value: displayValue(stack.standardOxygen) },
                ],
              ]}
            />
          </div>
        </InfoSection>

        <InfoSection
          title="의뢰기관 정보"
          action={editAction("의뢰기관 정보 수정", () => setClientEditOpen(true))}
        >
          <div className="space-y-2">
            <HighlightBox label="의뢰기관" value={displayValue(client.name)} />
            <InfoRows
              rows={[
                [
                  { label: "사업장", value: displayValue(workplace.name) },
                  {
                    label: "사업자번호",
                    value: client.bizNumber ? formatBusinessNumber(client.bizNumber) : "-",
                  },
                  // 주소는 한 칸에 담기지 않으므로 두 칸을 쓴다
                  {
                    label: "사업장주소",
                    span: 2,
                    value: displayValue(`${workplace.roadAddress} ${workplace.detailAddress}`.trim()),
                  },
                ],
                [
                  // 담당자는 측정계획마다 달라지므로 의뢰기관 스냅샷이 아니라 채취 스냅샷이 보유한다.
                  // 수정도 이 폼이 아니라 성적서 진행 일자(PATCH /report-dates) 소관이다.
                  { label: "배출시설 관리자", value: displayValue(samplingData?.facilityManager) },
                  { label: "시료채취 입회자", value: displayValue(samplingData?.samplingWitness) },
                  { label: "업종", value: displayValue(workplace.businessCategory) },
                  { label: "사업장 종별", value: gradeLabel(workplace.grade) },
                ],
              ]}
            />
          </div>
        </InfoSection>
      </div>

      <div className="min-w-0">
        <InfoSection
          title={
            <>
              측정항목{" "}
              <span className="text-body-4 text-brand-primary">{totalItemCount}개</span>
            </>
          }
          action={editAction("측정항목 수정", () => setItemsEditOpen(true))}
        >
          <MeasurementItems
            groups={groups}
            onEditItem={canEdit ? setEditingPollutantId : undefined}
          />
        </InfoSection>
      </div>

      {/* 열 때마다, 그리고 스냅샷이 갱신되면 key가 바뀌어 폼이 새 값으로 리마운트된다. */}
      {canEdit && (
        <>
          <UpdateScheduleBasicInfoForm
            key={`basic-${basicInfoEditFormKey}-${schedule.referenceNumber}-${schedule.sampledAt}-${schedule.schedulePurpose}`}
            scheduleId={scheduleId}
            schedule={schedule}
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
