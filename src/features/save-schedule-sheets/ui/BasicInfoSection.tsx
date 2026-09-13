import type { FieldTone } from "@shared/model";
import type { SectionHighlight } from "@shared/ui/accordion";
import { UnitField } from "@shared/ui/form";
import { SectionAccordion, SubAccordion } from "@shared/ui/accordion";

import { REQUIRED_BASIC_INFO_FIELDS, getMissingBasicInfoFields } from "../model/required-fields";
import { getProgressTone } from "../model/section-progress";
import type { ScheduleBasicInfoForm } from "../model/types";
import { FIELD_GRID } from "./sections/shell-props";

interface Props {
  basicInfoForm: ScheduleBasicInfoForm;
  editable: boolean;
  /** 저장을 한 번 눌렀는가 — 미입력 필수 칸의 빨강 표시 스위치 (기록지 섹션과 같은 규칙) */
  showMissing?: boolean;
  /** 섹션 바로가기의 스크롤 앵커 */
  id: string;
  /** 펼침 상태 — 바로가기가 기록지 섹션과 함께 다루므로 SheetsEditor 가 소유한다 */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (name: keyof ScheduleBasicInfoForm, value: string) => void;
}

const PERSON_FIELDS: { name: keyof ScheduleBasicInfoForm; label: string }[] = [
  { name: "mentorName", label: "채취자 (사수)" },
  { name: "menteeName", label: "채취자 (부사수)" },
  { name: "facilityManager", label: "배출시설 관리자" },
  { name: "samplingWitness", label: "환경기술인(시료채취입회자)" }
];

// 측정계획 단위(공통) 시료채취 시각·담당자 — 시트 전환과 무관하게 유지된다.
// 시트별 채취시각(수분·입자상)은 각 섹션에서 따로 입력한다.
export const BasicInfoSection = ({
  basicInfoForm, editable, showMissing = false, id, open, onOpenChange, onChange,
}: Props) => {
  // 진행도 배지는 저장 여부와 무관하게 늘 센다 — 기록지 섹션과 같은 규칙.
  const unfilled = getMissingBasicInfoFields(basicInfoForm);
  const progress = {
    done: REQUIRED_BASIC_INFO_FIELDS.length - unfilled.length,
    total: REQUIRED_BASIC_INFO_FIELDS.length,
  };

  /**
   * 빨강으로 칠할 필수 칸. 화면을 열자마자 칠하지 않고 저장을 한 번 누른 뒤부터 켜는 것은
   * 기록지 섹션과 같은 규칙이다 — 새 계획은 어차피 전부 비어 있어서, 처음부터 빨간 칸을
   * 보여주면 경고가 무뎌진다.
   */
  const missing = showMissing ? unfilled : [];

  const tone = (name: keyof ScheduleBasicInfoForm): FieldTone =>
    missing.includes(name) ? "danger" : "default";

  // 접어 둔 채로 저장하러 가는 흐름이 흔하므로 헤더에도 올린다.
  // 카드 테두리는 첫 배지의 톤을 따르므로 이 배지 하나가 빨간 테두리까지 맡는다.
  const highlights: SectionHighlight[] | undefined =
    missing.length > 0 ? [{ label: `미입력 ${missing.length}`, tone: "danger" }] : undefined;

  return (
    <SectionAccordion
      id={id}
      title="공통 정보"
      subtitle="채취시간 및 현장 담당자 정보를 입력합니다."
      open={open}
      onOpenChange={onOpenChange}
      progress={progress}
      progressTone={getProgressTone(progress)}
      highlights={highlights}
    >
      <div className="flex items-center gap-1">
        <UnitField
          label="측정 시작시간" type="time" className="flex-1"
          value={basicInfoForm.samplingStartedAt} disabled={!editable}
          tone={tone("samplingStartedAt")}
          onChange={(v) => onChange("samplingStartedAt", v)}
        />
        <span className="text-muted-ink">~</span>
        <UnitField
          label="측정 종료시간" type="time" className="flex-1"
          value={basicInfoForm.samplingEndedAt} disabled={!editable}
          tone={tone("samplingEndedAt")}
          onChange={(v) => onChange("samplingEndedAt", v)}
        />
      </div>
      <SubAccordion title="담당자">
        {/* 담당자는 필수가 아니라 완료 면색을 끈다 — 비워 둔 칸이 "덜 채웠다"로 읽히면 안 된다. */}
        <div className={FIELD_GRID}>
          {PERSON_FIELDS.map(({ name, label }) => (
            <UnitField
              key={name}
              label={label}
              showComplete={false}
              value={basicInfoForm[name]} disabled={!editable}
              onChange={(v) => onChange(name, v)}
            />
          ))}
        </div>
      </SubAccordion>
    </SectionAccordion>
  );
};
