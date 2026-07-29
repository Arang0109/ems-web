import type { SheetCalcPreview } from "@entities/schedule";
import { weatherConditionOptions, windDirectionOptions } from "@shared/model";
import { SectionAccordion } from "@shared/ui/accordion";
import { TableLabelCell, TableInputCell, TableResultCell, TableSelectCell } from "@shared/ui/table";

import type { WeatherForm } from "../../model/types";

interface Props {
  weather: WeatherForm;
  calc: SheetCalcPreview["weather"] | null;
  editable: boolean;
  onChange: (patch: Partial<WeatherForm>) => void;
}

const display = (v: number | null | undefined): string => (v == null ? "-" : String(v));

export const WeatherSection = ({ weather, calc, editable, onChange }: Props) => (
  <SectionAccordion title="기상정보 입력" defaultOpen>
    <div className="overflow-x-auto border-x border-b border-border rounded-b-nav">
      <table className="w-full border-collapse min-w-[720px]">
        <tbody>
          <tr>
            <TableLabelCell colSpan={2}>대기압 (hPa)</TableLabelCell>
            <TableLabelCell>기온 (°C)</TableLabelCell>
            <TableLabelCell>습도 (%)</TableLabelCell>
            <TableLabelCell>기상</TableLabelCell>
            <TableLabelCell>풍향</TableLabelCell>
            <TableLabelCell>풍속 (m/s)</TableLabelCell>
          </tr>
          <tr>
            <TableInputCell type="number" value={weather.pressure} unit="hPa" min={0.1} step={0.1}
              onChange={(v) => onChange({ pressure: v })} disabled={!editable} />
            <TableResultCell value={display(calc?.pa)} unit="mmHg" />
            <TableInputCell type="number" value={weather.temperature} unit="°C" step={0.1}
              onChange={(v) => onChange({ temperature: v })} disabled={!editable} />
            <TableInputCell type="number" value={weather.humidity} unit="%" min={0} max={100} step={0.1}
              onChange={(v) => onChange({ humidity: v })} disabled={!editable} />
            <TableSelectCell value={weather.weatherCondition} options={weatherConditionOptions}
              onChange={(v) => onChange({ weatherCondition: v })} disabled={!editable} />
            <TableSelectCell value={weather.windDirection} options={windDirectionOptions}
              onChange={(v) => onChange({ windDirection: v })} disabled={!editable} />
            <TableInputCell type="number" value={weather.windSpeed} unit="m/s" min={0} max={50} step={0.1}
              onChange={(v) => onChange({ windSpeed: v })} disabled={!editable} />
          </tr>
        </tbody>
      </table>
    </div>
  </SectionAccordion>
);
