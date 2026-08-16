import { useMemo, useState } from "react";
import { SquarePen } from "lucide-react";

import type { ScheduleSnapshot } from "@entities/schedule";
import type { StackPollutantListItem } from "@entities/stack-pollutant";
import { UpdateScheduleClientForm } from "@features/update-schedule-client";
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
  // 의뢰기관·사업장·측정시설은 한 스냅샷 트리라 하나의 폼에서 함께 수정한다.
  const [clientEditOpen, setClientEditOpen] = useState(false);

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const clientEditFormKey = useRemountKey(clientEditOpen);

  const groups = useMemo(
    () => groupPollutantsByCycle(snapshot?.items ?? [], stackPollutants),
    [snapshot?.items, stackPollutants],
  );

  if (!snapshot) {
    return <p className="py-8 text-center text-body-2 text-muted-ink">측정정보가 없습니다.</p>;
  }

  const { basicInfo, team, client } = snapshot;
  const workplace = client.workplace;
  const stack = workplace.stack;
  const canEdit = editable && scheduleId !== null;

  // 의뢰기관·측정시설 두 카드가 같은 폼을 연다(수정 진입점은 스냅샷 트리 하나로 통합돼 있다).
  const editAction = canEdit ? (
    <IconButton
      icon={<SquarePen size={19} />}
      label="의뢰기관·측정시설 정보 수정"
      variant="ghost"
      size="icon-sm"
      onClick={() => setClientEditOpen(true)}
    />
  ) : undefined;

  const totalItemCount = groups.reduce(
    (acc, group) => acc + group.current.length + group.others.length,
    0,
  );

  return (
    <div className="space-y-4">
      <SectionAccordion title="사전 정보">
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
        subtitle={<span className="text-body-4 text-brand-dark">{totalItemCount}개</span>}
        defaultOpen
      >
        <MeasurementItems groups={groups} />
      </SectionAccordion>

      <SectionAccordion title="측정시설 정보" action={editAction}>
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

      <SectionAccordion title="의뢰기관 정보">
        <DetailGrid>
          <DetailRow label="의뢰기관" value={value(client.name)} />
          <DetailRow label="사업장" value={value(workplace.name)} />
          {/* 주소는 한 열에 담기지 않아 줄바꿈으로 격자를 깨뜨리므로 데스크탑에서 전 열을 쓴다 */}
          <DetailRow
            label="사업장주소"
            span="full"
            value={value(`${workplace.roadAddress} ${workplace.detailAddress}`.trim())}
          />
          <DetailRow
            label="사업자번호"
            value={client.bizNumber ? formatBusinessNumber(client.bizNumber) : "-"}
          />
          {/* 담당자는 측정계획마다 달라지므로 의뢰기관 스냅샷이 아니라 basicInfo가 보유한다.
              수정도 이 폼이 아니라 기본정보(PATCH /basic-info) 소관이다. */}
          <DetailRow label="배출시설 관리자" value={value(basicInfo.facilityManager)} />
          <DetailRow label="시료채취 입회자" value={value(basicInfo.samplingWitness)} />
          <DetailRow label="사업장 종별" value={gradeLabel(workplace.grade)} />
          <DetailRow label="업종" value={value(workplace.businessCategory)} />
        </DetailGrid>
      </SectionAccordion>

      {canEdit && (
        // 열 때마다, 그리고 스냅샷이 갱신되면 key가 바뀌어 폼이 새 값으로 리마운트된다.
        <UpdateScheduleClientForm
          key={`${clientEditFormKey}-${client.clientId}-${client.name}-${workplace.name}-${stack.stackId}-${stack.name}-${stack.height}-${stack.horizontalLength}`}
          scheduleId={scheduleId}
          client={client}
          open={clientEditOpen}
          onOpenChange={setClientEditOpen}
          onSuccess={onRefetch}
        />
      )}
    </div>
  );
};
