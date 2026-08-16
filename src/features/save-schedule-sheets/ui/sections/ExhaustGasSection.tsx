import type { ReactNode } from "react";

import type { SheetCalcPreview } from "@entities/schedule";
import { SectionAccordion, SubAccordion } from "@shared/ui/accordion";
import { UnitField } from "@shared/ui/form";
import { HelpTip } from "@shared/ui/tooltip";

import { EXHAUST_GAS_HINT } from "../../model/field-hints";
import type { ExhaustGasForm, GasColumnKey } from "../../model/types";
import { GAS_READING_COUNT } from "../../model/types";
import { FIELD_GRID, type SectionShellProps } from "./shell-props";

interface Props extends SectionShellProps {
  exhaustGas: ExhaustGasForm;
  calc: SheetCalcPreview["exhaustGas"] | null;
  standardOxygen: number | null;      // 기준산소농도 (측정시설 원장, read-only)
  editable: boolean;
  onChange: (patch: Partial<ExhaustGasForm>) => void;
  onReadingChange: (key: GasColumnKey, index: number, value: string) => void;
}

const display = (v: number | null | undefined): string => (v == null ? "-" : String(v));

// 가스 성분 — 회차별 입력 그룹과 평균 그룹이 같은 목록을 공유한다.
const GAS_ROWS: {
  key: GasColumnKey;
  label: ReactNode;
  unit: string;
  avgKey: keyof SheetCalcPreview["exhaustGas"];
}[] = [
  { key: "o2", label: <>O<sub>2</sub></>, unit: "%", avgKey: "o2Avg" },
  { key: "co2", label: <>CO<sub>2</sub></>, unit: "%", avgKey: "co2Avg" },
  { key: "co", label: "CO", unit: "%", avgKey: "coAvg" },
  { key: "nox", label: "NOx", unit: "ppm", avgKey: "noxAvg" },
  { key: "sox", label: "SOx", unit: "ppm", avgKey: "soxAvg" },
];

export const ExhaustGasSection = ({
  exhaustGas, calc, standardOxygen, editable, onChange, onReadingChange, ...shell
}: Props) => (
  <SectionAccordion
    {...shell}
    title="배출가스 정보"
    description="1~3회 측정값을 입력하면 평균값이 계산됩니다. 평균 항목은 수정할 수 없습니다."
  >
    <div className={FIELD_GRID}>
      <UnitField
        label="가스분석기 측정 시작시간" required type="time"
        value={exhaustGas.gasAnalyzerStartTime} disabled={!editable}
        onChange={(v) => onChange({ gasAnalyzerStartTime: v })}
      />
      <UnitField
        label="THC 측정 시작시간" required type="time"
        value={exhaustGas.thcAnalyzerStartTime} disabled={!editable}
        onChange={(v) => onChange({ thcAnalyzerStartTime: v })}
      />
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
          {GAS_ROWS.map((row) => (
            <UnitField
              key={row.key}
              label={row.label} required unit={row.unit} type="number" step={0.1}
              value={exhaustGas[row.key][i] ?? ""} disabled={!editable}
              onChange={(v) => onReadingChange(row.key, i, v)}
            />
          ))}
        </div>
      </SubAccordion>
    ))}

    <SubAccordion title="평균 자동계산값" defaultOpen>
      <div className={FIELD_GRID}>
        {GAS_ROWS.map((row) => (
          <UnitField
            key={row.key}
            label={<>{row.label} 평균</>} unit={row.unit} readOnly
            value={display(calc?.[row.avgKey] as number | null)}
          />
        ))}
        <UnitField
          label={<>N<sub>2</sub> 평균</>} unit="%" readOnly value={display(calc?.n2)}
          hint={EXHAUST_GAS_HINT.n2} hintLabel="N2 평균 설명"
        />
        <UnitField
          label="기준산소농도" unit="%" readOnly value={display(standardOxygen)}
          hint={EXHAUST_GAS_HINT.standardOxygen}
        />
        <UnitField
          label="산소보정계수" readOnly value={display(calc?.o2CorrectionFactor)}
          hint={EXHAUST_GAS_HINT.o2CorrectionFactor}
        />
        <UnitField
          label={<>표준상태 배출가스밀도 (ρ)</>} unit="kg/Sm³" readOnly
          hint={EXHAUST_GAS_HINT.standardGasDensity} hintLabel="표준상태 배출가스밀도 설명"
          value={display(calc?.standardGasDensity)}
        />
      </div>
    </SubAccordion>
  </SectionAccordion>
);
