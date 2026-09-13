import { SectionAccordion } from "@shared/ui/accordion";
import { UnitField } from "@shared/ui/form";
import { InputTable, type InputTableColumn } from "@shared/ui/table";

import { EXHAUST_GAS_HINT } from "../../model/field-hints";
import type { ExhaustGasVisibility } from "../../model/measured-pollutants";
import { fieldPath } from "../../model/required-fields";
import type { ExhaustGasForm, GasColumnKey } from "../../model/types";
import { GAS_READING_COUNT } from "../../model/types";
import { visibleGasRows, type GasRow } from "./exhaust-gas-rows";
import type { FieldStateProps, SectionShellProps } from "./shell-props";

interface Props extends SectionShellProps, FieldStateProps {
  exhaustGas: ExhaustGasForm;
  /** 측정항목에 배정돼 입력칸을 열어 둘 오염물질 */
  visiblePollutants: ExhaustGasVisibility;
  editable: boolean;
  onChange: (patch: Partial<ExhaustGasForm>) => void;
  onReadingChange: (key: GasColumnKey, index: number, value: string) => void;
}

/**
 * 성분 이름 열 · 회차 열의 폭 (px).
 * 표를 `fit` 으로 세우므로 고정 폭이 아니라 **열 간 비율**이다 — 성분명이 회차 칸보다 넓다.
 */
const LABEL_WIDTH = 70;
const READING_WIDTH = 70;

/**
 * 배출가스 정보.
 *
 * 회차를 아코디언으로 나누지 않고 **행=성분, 열=회차인 표 하나**로 세운다.
 * 이 칸들을 읽는 목적이 "같은 성분의 회차 간 값 비교"(튀는 회차 찾기)라서,
 * 회차를 접어 두면 비교하려고 세 번 펼쳐야 한다.
 *
 * 모바일에서도 같은 표를 쓴다. 열이 4개(성분명 + 3회)뿐이라 `fit` 으로 화면 폭에 맞춘다 —
 * 가로 스크롤이 생기면 "한눈에 비교"라는 표의 이유가 사라지므로, 스크롤 대신 칸을 줄인다.
 */
export const ExhaustGasSection = ({
  exhaustGas, visiblePollutants,
  editable, onChange, onReadingChange, fieldTone, onFieldFocus, ...shell
}: Props) => {
  const gasRows = visibleGasRows(visiblePollutants);

  const columns: InputTableColumn<GasRow>[] = [
    {
      kind: "label", header: "항목", width: LABEL_WIDTH, align: "left",
      render: (row) => (
        <>
          {row.label} ({row.unit})
        </>
      ),
    },

    ...Array.from({ length: GAS_READING_COUNT }, (_, i): InputTableColumn<GasRow> => ({
      kind: "input",
      header: `${i + 1}회`,
      width: READING_WIDTH,
      type: "number",
      min: 0,
      step: 0.1,
      value: (row) => exhaustGas[row.key][i] ?? "",
      tone: (row) => fieldTone(fieldPath.exhaustReading(row.key, i)),
      onFocus: (row) => onFieldFocus(fieldPath.exhaustReading(row.key, i)),
      onChange: (row, v) => onReadingChange(row.key, i, v),
    })),
  ];

  return (
    <SectionAccordion
      {...shell}
      title="배출가스 정보"
      subtitle="O₂, CO₂, CO, NOx, SOx 측정값을 입력합니다."
    >
      <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-4">
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
      <InputTable
        fit
        rows={gasRows}
        columns={columns}
        getRowKey={(row) => row.key}
        editable={editable}
      />
    </SectionAccordion>
  );
};
