import type { SheetCalcPreview } from "@entities/schedule";
import { weatherConditionOptions, windDirectionOptions } from "@shared/model";
import { SectionAccordion } from "@shared/ui/accordion";
import { UnitField, CalcResultRow } from "@shared/ui/form";

import type { WeatherForm } from "../../model/types";
import { FIELD_GRID, type SectionShellProps } from "./shell-props";

interface Props extends SectionShellProps {
  weather: WeatherForm;
  calc: SheetCalcPreview["weather"] | null;
  editable: boolean;
  onChange: (patch: Partial<WeatherForm>) => void;
}

const display = (v: number | null | undefined): string => (v == null ? "-" : String(v));

export const WeatherSection = ({ weather, calc, editable, onChange, ...shell }: Props) => (
  <SectionAccordion
    {...shell}
    title="기상정보"
    description="단위가 표시된 숫자 항목은 숫자 키패드로 바로 입력할 수 있습니다."
  >
    <div className={FIELD_GRID}>
      <UnitField
        label="대기압" required unit="hPa" type="number" min={0.1} step={0.1}
        value={weather.pressure} disabled={!editable}
        onChange={(v) => onChange({ pressure: v })}
        helper={<CalcResultRow label="자동 환산" value={display(calc?.pa)} unit="mmHg" />}
      />
      <UnitField
        label="기온" required unit="°C" type="number" step={0.1}
        value={weather.temperature} disabled={!editable}
        onChange={(v) => onChange({ temperature: v })}
      />
      <UnitField
        label="습도" required unit="%" type="number" min={0} max={100} step={0.1}
        value={weather.humidity} disabled={!editable}
        onChange={(v) => onChange({ humidity: v })}
      />
      <UnitField
        label="기상" required options={weatherConditionOptions} placeholder="기상 선택"
        value={weather.weatherCondition} disabled={!editable}
        onChange={(v) => onChange({ weatherCondition: v })}
      />
      <UnitField
        label="풍향" options={windDirectionOptions} placeholder="풍향 선택"
        value={weather.windDirection} disabled={!editable}
        onChange={(v) => onChange({ windDirection: v })}
      />
      <UnitField
        label="풍속" required unit="m/s" type="number" min={0} max={50} step={0.1}
        value={weather.windSpeed} disabled={!editable}
        onChange={(v) => onChange({ windSpeed: v })}
      />
    </div>
  </SectionAccordion>
);
