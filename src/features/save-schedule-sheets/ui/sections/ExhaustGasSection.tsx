import type { SheetCalcPreview } from "@entities/schedule";
import { SectionAccordion } from "@shared/ui/accordion";
import { TableLabelCell, TableInputCell, TableResultCell } from "@shared/ui/table";

import type { ExhaustGasForm, GasColumnKey } from "../../model/types";
import { GAS_READING_COUNT } from "../../model/types";

interface Props {
  exhaustGas: ExhaustGasForm;
  calc: SheetCalcPreview["exhaustGas"] | null;
  standardOxygen: number | null;      // 기준산소농도 (측정시설 원장, read-only)
  editable: boolean;
  onChange: (patch: Partial<ExhaustGasForm>) => void;
  onReadingChange: (key: GasColumnKey, index: number, value: string) => void;
}

const display = (v: number | null | undefined): string => (v == null ? "-" : String(v));

// 가스 성분별 행: 라벨 | 1~3회 입력 | 평균(계산)
const GAS_ROWS: { key: GasColumnKey; label: string; avgKey: keyof SheetCalcPreview["exhaustGas"] }[] = [
  { key: "o2", label: "O₂ (%)", avgKey: "o2Avg" },
  { key: "co2", label: "CO₂ (%)", avgKey: "co2Avg" },
  { key: "co", label: "CO (%)", avgKey: "coAvg" },
  { key: "nox", label: "NOx (ppm)", avgKey: "noxAvg" },
  { key: "sox", label: "SOx (ppm)", avgKey: "soxAvg" },
];

export const ExhaustGasSection = ({
  exhaustGas, calc, standardOxygen, editable, onChange, onReadingChange,
}: Props) => (
  <SectionAccordion title="배출가스정보" defaultOpen>
    <div className="overflow-x-auto border-x border-b border-border rounded-b-nav">
      <table className="w-full border-collapse min-w-[720px]">
        <tbody>
          <tr>
            <TableLabelCell>항목</TableLabelCell>
            {Array.from({ length: GAS_READING_COUNT }, (_, i) => (
              <TableLabelCell key={i}>{i + 1}회</TableLabelCell>
            ))}
            <TableLabelCell>평균</TableLabelCell>
          </tr>

          {GAS_ROWS.map((row) => (
            <tr key={row.key}>
              <TableLabelCell>{row.label}</TableLabelCell>
              {Array.from({ length: GAS_READING_COUNT }, (_, i) => (
                <TableInputCell key={i} type="number" value={exhaustGas[row.key][i] ?? ""} step={0.1}
                  onChange={(v) => onReadingChange(row.key, i, v)} disabled={!editable} />
              ))}
              <TableResultCell value={display(calc?.[row.avgKey] as number | null)} />
            </tr>
          ))}

          <tr>
            <TableLabelCell>N₂ (%)</TableLabelCell>
            <TableResultCell value={display(calc?.n2)} unit="%" colSpan={GAS_READING_COUNT + 1} />
          </tr>
          <tr>
            <TableLabelCell>기준산소농도</TableLabelCell>
            <TableResultCell value={display(standardOxygen)} unit="%" colSpan={GAS_READING_COUNT + 1} />
          </tr>
          <tr>
            <TableLabelCell>산소보정계수</TableLabelCell>
            <TableResultCell value={display(calc?.o2CorrectionFactor)} colSpan={GAS_READING_COUNT + 1} />
          </tr>
          <tr>
            <TableLabelCell>표준상태 배출가스밀도 (ρ)</TableLabelCell>
            <TableResultCell value={display(calc?.standardGasDensity)} unit="kg/Sm³" colSpan={GAS_READING_COUNT + 1} />
          </tr>
          <tr>
            <TableLabelCell colSpan={2}>가스분석기 측정 시작시간</TableLabelCell>
            <TableInputCell type="time" value={exhaustGas.gasAnalyzerStartTime}
              onChange={(v) => onChange({ gasAnalyzerStartTime: v })} disabled={!editable} />
            <TableLabelCell>THC 측정 시작시간</TableLabelCell>
            <TableInputCell type="time" value={exhaustGas.thcAnalyzerStartTime}
              onChange={(v) => onChange({ thcAnalyzerStartTime: v })} disabled={!editable} />
          </tr>
        </tbody>
      </table>
    </div>
  </SectionAccordion>
);
