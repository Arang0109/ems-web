import { useState } from "react";
import { Pencil } from "lucide-react";

import type { ScheduleSnapshot } from "@entities/schedule";
import { UpdateScheduleClientForm } from "@features/update-schedule-client";
import { formatBusinessNumber } from "@shared/lib";
import { MEASUREMENT_METHOD_LABEL, MEASUREMENT_CYCLE_LABEL, MEASUREMENT_TYPE_LABEL } from "@shared/config";
import { Divider } from "@shared/ui/borders";
import { IconButton } from "@shared/ui/buttons";
import { SectionTitle } from "@shared/ui/form";

import {
  value, fieldLabel, gradeLabel, shapeLabel, orientationLabel, describeDimension,
} from "../../model/mapper";

interface Props {
  scheduleId: number | null;
  snapshot: ScheduleSnapshot | null;
  editable: boolean;
  onRefetch: () => void;
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-muted/40 rounded-xl px-4 py-3">
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground break-all">{value}</p>
  </div>
);

export const MeasurementInfo = ({ scheduleId, snapshot, editable, onRefetch }: Props) => {
  // 의뢰기관·사업장·측정시설은 한 스냅샷 트리라 하나의 폼에서 함께 수정한다.
  const [clientEditOpen, setClientEditOpen] = useState(false);

  if (!snapshot) {
    return <p className="text-sm text-muted-foreground text-center py-8">측정정보가 없습니다.</p>;
  }

  const { basicInfo, team, client, items } = snapshot;
  const workplace = client.workplace;
  const stack = workplace.stack;
  const canEdit = editable && scheduleId !== null;

  return (
    <div className="space-y-6">
      {/* 사전 정보 */}
      <div className="space-y-2">
        <SectionTitle>사전 정보</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <InfoItem label="관리번호" value={value(basicInfo.referenceNumber)} />
          {/* sampledAt은 LocalDate("yyyy-MM-dd") — Date 파싱 없이 원문 표시 */}
          <InfoItem label="측정 일자" value={value(basicInfo.sampledAt)} />
          <InfoItem label="측정 분야" value={fieldLabel(basicInfo.measurementField)} />
          <InfoItem label="측정 용도" value={basicInfo.schedulePurpose ? (MEASUREMENT_TYPE_LABEL[basicInfo.schedulePurpose] ?? basicInfo.schedulePurpose) : "-"} />
          <InfoItem label="측정 팀" value={value(team.teamName)} />
        </div>
      </div>

      <Divider />

      {/* 의뢰기관 정보 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <SectionTitle>의뢰기관 정보</SectionTitle>
          {canEdit && (
            <IconButton
              icon={<Pencil size={12} />}
              label="수정"
              size="xs"
              onClick={() => setClientEditOpen(true)}
            />
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoItem label="의뢰기관" value={value(client.name)} />
          <InfoItem label="사업장" value={value(workplace.name)} />
          <InfoItem label="사업장 주소" value={value(`${workplace.roadAddress} ${workplace.detailAddress}`.trim())} />
          <InfoItem label="사업장 사업자번호" value={client.bizNumber ? formatBusinessNumber(client.bizNumber) : "-"} />
          {/* 담당자는 측정계획마다 달라지므로 의뢰기관 스냅샷이 아니라 basicInfo가 보유한다.
              수정도 이 폼이 아니라 기본정보(PATCH /basic-info) 소관이다. */}
          <InfoItem label="배출시설 관리자" value={value(basicInfo.facilityManager)} />
          <InfoItem label="시료채취 입회자 (환경기술인)" value={value(basicInfo.samplingWitness)} />
          <InfoItem label="사업장 종별" value={gradeLabel(workplace.grade)} />
        </div>

        {canEdit && (
          // 스냅샷이 갱신되면 key가 바뀌어 폼이 새 값으로 리마운트된다.
          <UpdateScheduleClientForm
            key={`${client.clientId}-${client.name}-${workplace.name}-${stack.stackId}-${stack.name}-${stack.height}-${stack.horizontalLength}`}
            scheduleId={scheduleId}
            client={client}
            open={clientEditOpen}
            onOpenChange={setClientEditOpen}
            onSuccess={onRefetch}
          />
        )}
      </div>

      <Divider />

      {/* 측정시설 정보 */}
      <div className="space-y-2">
        {/* 수정 진입점은 '의뢰기관 정보' 섹션 하나로 통합되어 있다. */}
        <SectionTitle>측정시설 정보</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <InfoItem label="측정시설" value={value(stack.name)} />
          <InfoItem label="SEMS 번호" value={value(stack.semsNumber)} />
          <InfoItem label="측정시설 종별" value={gradeLabel(stack.grade)} />
          <InfoItem label="업종" value={value(stack.businessCategory)} />
          <InfoItem label="주요 생산품" value={value(stack.mainProduct)} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <InfoItem label="방향" value={orientationLabel(stack.orientation)} />
          <InfoItem label="형태" value={shapeLabel(stack.shape)} />
          <InfoItem label="지름 / 크기" value={describeDimension(stack.shape, stack.horizontalLength, stack.verticalLength)} />
          <InfoItem label="측정공 높이 (m)" value={value(stack.height)} />
          <InfoItem label="기준산소농도 (%)" value={value(stack.standardOxygen)} />
        </div>
      </div>

      <Divider />

      {/* 측정항목 */}
      <div className="space-y-3">
        <SectionTitle>측정항목</SectionTitle>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">등록된 측정항목이 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">오염물질명</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">영문명</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">측정방법</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">측정주기</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">허용기준</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.stackPollutantId} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-3 font-medium text-foreground">{value(item.nameKr)}</td>
                  <td className="py-3 px-3 text-muted-foreground">{value(item.nameEn)}</td>
                  <td className="py-3 px-3 text-foreground">{MEASUREMENT_METHOD_LABEL[item.method] ?? item.method}</td>
                  <td className="py-3 px-3 text-foreground">{MEASUREMENT_CYCLE_LABEL[item.cycle] ?? item.cycle}</td>
                  <td className="py-3 px-3 text-foreground">{value(item.allowance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
