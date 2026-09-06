import type { FieldTone } from "@shared/model";
import type { SectionHighlight } from "@shared/ui/accordion";
import { InlineInput, InputGroup } from "@shared/ui/form";
import { SectionAccordion, SubAccordion } from "@shared/ui/accordion";

import { getMissingBasicInfoFields } from "../model/required-fields";
import type { ScheduleBasicInfoForm } from "../model/types";

interface Props {
  basicInfoForm: ScheduleBasicInfoForm;
  editable: boolean;
  /** 저장을 한 번 눌렀는가 — 미입력 필수 칸의 빨강 표시 스위치 (기록지 섹션과 같은 규칙) */
  showMissing?: boolean;
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
export const BasicInfoSection = ({
  basicInfoForm, editable, showMissing = false, onChange,
}: Props) => {
  /**
   * 비어 있는 필수 칸. 화면을 열자마자 칠하지 않고 저장을 한 번 누른 뒤부터 켜는 것은
   * 기록지 섹션과 같은 규칙이다 — 새 계획은 어차피 전부 비어 있어서, 처음부터 빨간 칸을
   * 보여주면 경고가 무뎌진다.
   */
  const missing = showMissing ? getMissingBasicInfoFields(basicInfoForm) : [];

  const tone = (name: keyof ScheduleBasicInfoForm): FieldTone =>
    missing.includes(name) ? "danger" : "default";

  // 접어 둔 채로 저장하러 가는 흐름이 흔하므로 헤더에도 올린다.
  // 카드 테두리는 첫 배지의 톤을 따르므로 이 배지 하나가 빨간 테두리까지 맡는다.
  const highlights: SectionHighlight[] | undefined =
    missing.length > 0 ? [{ label: `미입력 ${missing.length}`, tone: "danger" }] : undefined;

  return (
    <SectionAccordion
      title="공통 정보"
      subtitle="총 채취시간 및 현장 담당자 정보를 입력합니다."
      highlights={highlights}
    >
      <SubAccordion title="총 채취시간" defaultOpen>
        <div className="flex flex-wrap items-center gap-3">
          <InlineInput
            type="time" width="w-32" prefix="시작"
            value={basicInfoForm.samplingStartedAt} disabled={!editable}
            tone={tone("samplingStartedAt")}
            onChange={(v) => onChange("samplingStartedAt", v)}
          />
          <span className="text-muted-ink">~</span>
          <InlineInput
            type="time" width="w-32" prefix="종료"
            value={basicInfoForm.samplingEndedAt} disabled={!editable}
            tone={tone("samplingEndedAt")}
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
};
