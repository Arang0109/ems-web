import { Input, Select, SectionTitle } from "@shared/ui/form";
import { weatherConditionOptions, windDirectionOptions } from "@shared/model";

import type { WeatherForm } from "../../model/types";

interface Props {
  weather: WeatherForm;
  pa: number | null;
  editable: boolean;
  onChange: (patch: Partial<WeatherForm>) => void;
}

const display = (v: number | null): string => (v == null ? "-" : String(v));

export const WeatherSection = ({ weather, pa, editable, onChange }: Props) => (
  <section className="space-y-3">
    <SectionTitle>기상 정보</SectionTitle>
    <div className="grid md:grid-cols-3 gap-3">
      <Input id="pressure" label="대기압 (hPa)" type="number" value={weather.pressure}
        onChange={(v) => onChange({ pressure: v })} disabled={!editable} />
      <Select id="weatherCondition" label="기상" placeholder="선택" value={weather.weatherCondition}
        options={weatherConditionOptions} onValueChange={(v) => onChange({ weatherCondition: v ?? "" })} disabled={!editable} />
      <Input label="기온 (°C)" type="number" value={weather.temperature}
        onChange={(v) => onChange({ temperature: v })} disabled={!editable} />
      <Input label="습도 (%)" type="number" value={weather.humidity}
        onChange={(v) => onChange({ humidity: v })} disabled={!editable} />
      <Select id="windDirection" label="풍향" placeholder="선택" value={weather.windDirection}
        options={windDirectionOptions} onValueChange={(v) => onChange({ windDirection: v ?? "" })} disabled={!editable} />
      <Input label="풍속 (m/s)" type="number" value={weather.windSpeed}
        onChange={(v) => onChange({ windSpeed: v })} disabled={!editable} />
      <Input label="대기압 Pa (mmHg, 계산)" value={display(pa)} readOnly disabled />
    </div>
  </section>
);
