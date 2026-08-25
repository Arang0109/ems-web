import { SectionAccordion, SubAccordion } from "@shared/ui/accordion";
import { UnitField } from "@shared/ui/form";
import { HelpTip } from "@shared/ui/tooltip";

import { EXHAUST_GAS_HINT } from "../../model/field-hints";
import type { ExhaustGasVisibility } from "../../model/measured-pollutants";
import { fieldPath } from "../../model/required-fields";
import type { ExhaustGasForm, GasColumnKey } from "../../model/types";
import { GAS_READING_COUNT } from "../../model/types";
import { visibleGasRows } from "./exhaust-gas-rows";
import { FIELD_GRID, type FieldStateProps, type SectionShellProps } from "./shell-props";

interface Props extends SectionShellProps, FieldStateProps {
  exhaustGas: ExhaustGasForm;
  /** 측정항목에 배정돼 입력칸을 열어 둘 오염물질 */
  visiblePollutants: ExhaustGasVisibility;
  editable: boolean;
  onChange: (patch: Partial<ExhaustGasForm>) => void;
  onReadingChange: (key: GasColumnKey, index: number, value: string) => void;
}

export const ExhaustGasSection = ({
  exhaustGas, visiblePollutants,
  editable, onChange, onReadingChange, fieldTone, onFieldFocus, ...shell
}: Props) => {
  const gasRows = visibleGasRows(visiblePollutants);

  return (
    <SectionAccordion
      {...shell}
      title="배출가스 정보"
      subtitle="O₂, CO₂, CO 등 가스 농도 측정값을 입력합니다."
      description="1~3회 측정값을 입력하면 평균값이 자동으로 계산됩니다(하단 [계산값]). THC, NOx, SOx는 해당 측정항목이 있는 경우에만 입력란이 표시됩니다."
    >
      <div className={FIELD_GRID}>
        <UnitField
          label="가스분석기 측정 시작시간" type="time"
          hint={EXHAUST_GAS_HINT.gasAnalyzer}
          value={exhaustGas.gasAnalyzerStartTime} disabled={!editable}
          tone={fieldTone(fieldPath.exhaustTime("gasAnalyzerStartTime"))}
          onFocus={() => onFieldFocus(fieldPath.exhaustTime("gasAnalyzerStartTime"))}
          onChange={(v) => onChange({ gasAnalyzerStartTime: v })}
        />
        {visiblePollutants.thc && (
          <UnitField
            label="THC 측정 시작시간" required type="time"
            value={exhaustGas.thcAnalyzerStartTime} disabled={!editable}
            tone={fieldTone(fieldPath.exhaustTime("thcAnalyzerStartTime"))}
            onFocus={() => onFieldFocus(fieldPath.exhaustTime("thcAnalyzerStartTime"))}
            onChange={(v) => onChange({ thcAnalyzerStartTime: v })}
          />
        )}
      </div>

      {/* 회차별 도움말은 그룹 헤더에 하나만 둔다 — 성분마다 달면 같은 문구가 15개 붙는다 */}
      {Array.from({ length: GAS_READING_COUNT }, (_, i) => (
        <SubAccordion
          key={i}
          title={`${i + 1}회 입력`}
          defaultOpen={i === 0}
          action={<HelpTip content={EXHAUST_GAS_HINT.reading} label={`${i + 1}회 입력 설명`} />}
        >
          <div className={FIELD_GRID}>
            {gasRows.map((row) => (
              <UnitField
                key={row.key}
                label={row.label} required unit={row.unit} type="number" min={0} step={0.1}
                value={exhaustGas[row.key][i] ?? ""} disabled={!editable}
                tone={fieldTone(fieldPath.exhaustReading(row.key, i))}
                onFocus={() => onFieldFocus(fieldPath.exhaustReading(row.key, i))}
                onChange={(v) => onReadingChange(row.key, i, v)}
              />
            ))}
          </div>
        </SubAccordion>
      ))}
    </SectionAccordion>
  );
};
