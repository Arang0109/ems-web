import type { ScheduleSnapshot } from "@entities/schedule";
import { formatDateTime, formatBusinessNumber, formatPhoneNumber } from "@shared/lib";
import { MEASUREMENT_METHOD_LABEL, MEASUREMENT_CYCLE_LABEL, MEASUREMENT_TYPE_LABEL } from "@shared/config";
import { Divider } from "@shared/ui/borders";

import {
  value, fieldLabel, gradeLabel, shapeLabel, orientationLabel, describeDimension,
} from "../../model/mapper";

interface Props {
  snapshot: ScheduleSnapshot | null;
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-muted/40 rounded-xl px-4 py-3">
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground break-all">{value}</p>
  </div>
);

const SectionLabel = ({ children }: { children: string }) => (
  <p className="text-xs font-semibold text-muted-foreground">{children}</p>
);

export const MeasurementInfo = ({ snapshot }: Props) => {
  if (!snapshot) {
    return <p className="text-sm text-muted-foreground text-center py-8">측정정보가 없습니다.</p>;
  }

  const { basicInfo, team, client, items } = snapshot;
  const workplace = client.workplace;
  const stack = workplace.stack;

  return (
    <div className="space-y-6">
      {/* 사전 정보 */}
      <div className="space-y-2">
        <SectionLabel>사전 정보</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoItem label="관리번호" value={value(basicInfo.referenceNumber)} />
          <InfoItem label="측정 일자" value={basicInfo.measureDate ? formatDateTime(basicInfo.measureDate) : "-"} />
          <InfoItem label="측정 분야" value={fieldLabel(basicInfo.measurementField)} />
          <InfoItem label="측정 용도" value={basicInfo.measurementType ? (MEASUREMENT_TYPE_LABEL[basicInfo.measurementType] ?? basicInfo.measurementType) : "-"} />
          <InfoItem label="측정 팀" value={value(team.teamName)} />
          <InfoItem label="채취자(사수)" value={value(team.mentorName)} />
          <InfoItem label="채취자(부사수)" value={value(team.menteeName)} />
        </div>
      </div>

      <Divider />

      {/* 의뢰기관 정보 */}
      <div className="space-y-2">
        <SectionLabel>의뢰기관 정보</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoItem label="거래처" value={value(client.name)} />
          <InfoItem label="사업자번호" value={client.bizNumber ? formatBusinessNumber(client.bizNumber) : "-"} />
          <InfoItem label="대표자" value={value(client.representative)} />
          <InfoItem label="담당자" value={value(client.manager)} />
          <InfoItem label="연락처" value={client.tel ? formatPhoneNumber(client.tel) : "-"} />
          <InfoItem label="사업장" value={value(workplace.name)} />
          <InfoItem label="사업장 종별" value={gradeLabel(workplace.grade)} />
          <InfoItem label="주소" value={value(`${client.roadAddress} ${client.detailAddress}`.trim())} />
        </div>
      </div>

      <Divider />

      {/* 측정시설 정보 */}
      <div className="space-y-2">
        <SectionLabel>측정시설 정보</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoItem label="측정시설명" value={value(stack.name)} />
          <InfoItem label="SEMS 번호" value={value(stack.semsNumber)} />
          <InfoItem label="측정 분야" value={fieldLabel(stack.field)} />
          <InfoItem label="시설 종별" value={gradeLabel(stack.grade)} />
          <InfoItem label="기준산소농도 (%)" value={value(stack.standardOxygen)} />
          <InfoItem label="측정공 높이 (m)" value={value(stack.height)} />
          <InfoItem label="형태" value={shapeLabel(stack.shape)} />
          <InfoItem label="지름 / 크기" value={describeDimension(stack.shape, stack.horizontalLength, stack.verticalLength)} />
          <InfoItem label="방향" value={orientationLabel(stack.orientation)} />
        </div>
      </div>

      <Divider />

      {/* 측정항목 */}
      <div className="space-y-3">
        <SectionLabel>측정항목</SectionLabel>
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
