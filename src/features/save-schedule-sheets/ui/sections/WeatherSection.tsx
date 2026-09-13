import type { SheetCalcPreview } from "@entities/schedule";
import { weatherConditionOptions, windDirectionOptions } from "@shared/model";
import { SectionAccordion } from "@shared/ui/accordion";
import { UnitField, CalcResultRow } from "@shared/ui/form";

import { WEATHER_HINT } from "../../model/field-hints";
import { fieldPath } from "../../model/required-fields";
import type { WeatherForm } from "../../model/types";
import type {  FieldStateProps, SectionShellProps } from "./shell-props";

interface Props extends SectionShellProps, FieldStateProps {
  weather: WeatherForm;
  calc: SheetCalcPreview["weather"] | null;
  editable: boolean;
  onChange: (patch: Partial<WeatherForm>) => void;
}

const display = (v: number | null | undefined): string => (v == null ? "-" : String(v));

export const WeatherSection = ({
  weather, calc, editable, onChange, fieldTone, onFieldFocus, ...shell
}: Props) => (
  <SectionAccordion
    {...shell}
    title="기상정보"
    subtitle="측정 현장의 기상 상태를 입력합니다."
  >
    <div className="grid grid-cols-2 gap-x-5 gap-y-3 md:grid-cols-3 xl:grid-cols-6">
      <UnitField
        label="대기압" unit="hPa" type="number" min={0.1} step={0.1}
        hint={WEATHER_HINT.pressure}
        value={weather.pressure} disabled={!editable}
        tone={fieldTone(fieldPath.weather("pressure"))}
        onFocus={() => onFieldFocus(fieldPath.weather("pressure"))}
        onChange={(v) => onChange({ pressure: v })}
        helper={<CalcResultRow label="단위 환산 :" value={display(calc?.pa)} unit="mmHg" />}
      />
      <UnitField
        label="기온" unit="°C" type="number" step={0.1}
        hint={WEATHER_HINT.temperature}
        value={weather.temperature} disabled={!editable}
        tone={fieldTone(fieldPath.weather("temperature"))}
        onFocus={() => onFieldFocus(fieldPath.weather("temperature"))}
        onChange={(v) => onChange({ temperature: v })}
      />
      <UnitField
        label="습도" unit="%" type="number" min={0} max={100} step={0.1}
        hint={WEATHER_HINT.humidity}
        value={weather.humidity} disabled={!editable}
        tone={fieldTone(fieldPath.weather("humidity"))}
        onFocus={() => onFieldFocus(fieldPath.weather("humidity"))}
        onChange={(v) => onChange({ humidity: v })}
      />
      <UnitField
        label="기상" options={weatherConditionOptions} placeholder="선택"
        hint={WEATHER_HINT.weatherCondition}
        value={weather.weatherCondition} disabled={!editable}
        tone={fieldTone(fieldPath.weather("weatherCondition"))}
        onFocus={() => onFieldFocus(fieldPath.weather("weatherCondition"))}
        onChange={(v) => onChange({ weatherCondition: v })}
      />
      <UnitField
        label="풍향" options={windDirectionOptions} placeholder="선택"
        hint={WEATHER_HINT.windDirection}
        value={weather.windDirection} disabled={!editable}
        tone={fieldTone(fieldPath.weather("windDirection"))}
        onFocus={() => onFieldFocus(fieldPath.weather("windDirection"))}
        onChange={(v) => onChange({ windDirection: v })}
      />
      <UnitField
        label="풍속" unit="m/s" type="number" min={0} max={50} step={0.1}
        hint={WEATHER_HINT.windSpeed}
        value={weather.windSpeed} disabled={!editable}
        tone={fieldTone(fieldPath.weather("windSpeed"))}
        onFocus={() => onFieldFocus(fieldPath.weather("windSpeed"))}
        onChange={(v) => onChange({ windSpeed: v })}
      />
    </div>
  </SectionAccordion>
);
