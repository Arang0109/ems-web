import { InlineInput, InputGroup } from "@shared/ui/form";
import { SectionAccordion, SubAccordion } from "@shared/ui/accordion";

import type { ScheduleBasicInfoForm } from "../model/types";

interface Props {
  basicInfoForm: ScheduleBasicInfoForm;
  editable: boolean;
  onChange: (name: keyof ScheduleBasicInfoForm, value: string) => void;
}

const PERSON_FIELDS: { name: keyof ScheduleBasicInfoForm; label: string }[] = [
  { name: "mentorName", label: "채취자(사수)" },
  { name: "menteeName", label: "채취자(부사수)" },
  { name: "facilityManager", label: "배출시설관리자" },
  { name: "samplingWitness", label: "환경기술인(시료채취입회자)" }
];

// 측정계획 단위(공통) 시료채취 시각·담당자 — 시트 전환과 무관하게 유지된다.
// 시트별 채취시각(수분·입자상)은 각 섹션에서 따로 입력한다.
export const BasicInfoSection = ({ basicInfoForm, editable, onChange }: Props) => (
  <SectionAccordion
    title="공통 정보"
    subtitle="총 채취시간 및 현장 담당자 정보를 입력합니다."
  >
    <SubAccordion title="총 채취시간" defaultOpen>
      <div className="flex flex-wrap items-center gap-3">
        <InlineInput
          type="time" width="w-32" prefix="시작"
          value={basicInfoForm.samplingStartedAt} disabled={!editable}
          onChange={(v) => onChange("samplingStartedAt", v)}
        />
        <span className="text-muted-ink">~</span>
        <InlineInput
          type="time" width="w-32" prefix="종료"
          value={basicInfoForm.samplingEndedAt} disabled={!editable}
          onChange={(v) => onChange("samplingEndedAt", v)}
        />
        <span className="text-caption text-muted-ink">
          모든 기록지의 공통 값이며 저장 시 함께 반영됩니다.
        </span>
      </div>
      
    </SubAccordion>
    <SubAccordion title="담당자">
      <div className="grid grid-cols-1 gap-x-5 gap-y-2 md:grid-cols-3 xl:grid-cols-6">
        {PERSON_FIELDS.map(({ name, label }) => (
          <InputGroup
            key={name}
            label={label}
            value={basicInfoForm[name]} disabled={!editable}
            onChange={(v) => onChange(name, v)}
          />
        ))}
      </div>
    </SubAccordion>
  </SectionAccordion>
);
