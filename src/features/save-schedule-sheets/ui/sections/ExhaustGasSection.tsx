import { Plus, Trash2 } from "lucide-react";

import { Input, SectionTitle } from "@shared/ui/form";
import { Button } from "@shared/ui/buttons";

import type { ExhaustGasForm, GasReadingForm } from "../../model/types";

interface Props {
  exhaustGas: ExhaustGasForm;
  gasDensity: number | null;
  o2CorrectionFactor: number | null;
  editable: boolean;
  onChange: (patch: Partial<ExhaustGasForm>) => void;
  onReadingChange: (index: number, patch: Partial<GasReadingForm>) => void;
  onAddReading: () => void;
  onRemoveReading: (index: number) => void;
}

const display = (v: number | null): string => (v == null ? "-" : String(v));
const GAS_COLS: { key: keyof GasReadingForm; label: string }[] = [
  { key: "o2", label: "O₂ (%)" },
  { key: "co2", label: "CO₂ (%)" },
  { key: "co", label: "CO (ppm)" },
  { key: "nox", label: "NOx (ppm)" },
  { key: "sox", label: "SOx (ppm)" },
];

export const ExhaustGasSection = ({
  exhaustGas, gasDensity, o2CorrectionFactor, editable,
  onChange, onReadingChange, onAddReading, onRemoveReading,
}: Props) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between">
      <SectionTitle>배출가스</SectionTitle>
      <Button type="button" variant="outline" size="sm" onClick={onAddReading} disabled={!editable}>
        <Plus size={14} className="mr-1" />측정 회수 추가
      </Button>
    </div>

    <div className="space-y-2">
      {exhaustGas.readings.map((reading, index) => (
        <div key={index} className="flex items-end gap-2">
          <span className="w-8 pb-2 text-xs text-muted-foreground">#{index + 1}</span>
          <div className="grid grid-cols-5 gap-2 flex-1">
            {GAS_COLS.map((col) => (
              <Input key={col.key} label={index === 0 ? col.label : undefined} type="number"
                value={reading[col.key]}
                onChange={(v) => onReadingChange(index, { [col.key]: v })}
                disabled={!editable} />
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveReading(index)}
            disabled={!editable || exhaustGas.readings.length <= 1}>
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
    </div>

    <div className="grid md:grid-cols-4 gap-3">
      <Input label="가스분석기 시작시간" type="time" value={exhaustGas.gasAnalyzerStartTime}
        onChange={(v) => onChange({ gasAnalyzerStartTime: v })} disabled={!editable} />
      <Input label="THC 분석기 시작시간" type="time" value={exhaustGas.thcAnalyzerStartTime}
        onChange={(v) => onChange({ thcAnalyzerStartTime: v })} disabled={!editable} />
      <Input label="배출가스밀도 (계산)" value={display(gasDensity)} readOnly disabled />
      <Input label="산소보정계수 (계산)" value={display(o2CorrectionFactor)} readOnly disabled />
    </div>
  </section>
);
