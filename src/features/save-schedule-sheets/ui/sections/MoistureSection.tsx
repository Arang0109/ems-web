import type { SheetCalcPreview } from "@entities/schedule";
import { SectionAccordion, SubAccordion } from "@shared/ui/accordion";
import { UnitField, CalcResultRow } from "@shared/ui/form";

import type { MoistureForm } from "../../model/types";
import { FIELD_GRID, type SectionShellProps } from "./shell-props";

interface Props extends SectionShellProps {
  moisture: MoistureForm;
  calc: SheetCalcPreview["moisture"] | null;
  editable: boolean;
  onChange: (patch: Partial<MoistureForm>) => void;
}

const display = (v: number | null | undefined): string => (v == null ? "-" : String(v));

// "전/후를 입력하면 차이·환산·수분량이 계산된다"는 흐름을 그대로 두 그룹으로 나눈다.
// 온도는 도메인상 건식가스미터 입구/출구 온도라 기록지 용어를 유지한다.
export const MoistureSection = ({ moisture, calc, editable, onChange, ...shell }: Props) => (
  <SectionAccordion
    {...shell}
    title="수분량 계산"
    description="직접 측정한 값만 입력하면 차이·환산값·수분량을 자동으로 계산합니다."
  >
    <SubAccordion title="흡습병·온도·흡인량" defaultOpen>
      <div className={FIELD_GRID}>
        <UnitField
          label="흡습병 무게 - 전" required unit="g" type="number" step={0.01}
          value={moisture.weightBefore} disabled={!editable}
          onChange={(v) => onChange({ weightBefore: v })}
        />
        <UnitField
          label="흡습병 무게 - 후" required unit="g" type="number" step={0.01}
          value={moisture.weightAfter} disabled={!editable}
          onChange={(v) => onChange({ weightAfter: v })}
          helper={<CalcResultRow label="무게차이 자동계산" value={display(calc?.ma)} unit="g" />}
        />
        <UnitField
          label="온도 - 입구" required unit="°C" type="number" step={0.1}
          value={moisture.gasMeterTempIn} disabled={!editable}
          onChange={(v) => onChange({ gasMeterTempIn: v })}
        />
        <UnitField
          label="온도 - 출구" required unit="°C" type="number" step={0.1}
          value={moisture.gasMeterTempOut} disabled={!editable}
          onChange={(v) => onChange({ gasMeterTempOut: v })}
          helper={<CalcResultRow label="평균온도 자동계산" value={display(calc?.tm_g)} unit="°C" />}
        />
        <UnitField
          label="흡인량 - 전" required unit="L" type="number" step={0.001}
          value={moisture.dryGasVolumeBefore} disabled={!editable}
          onChange={(v) => onChange({ dryGasVolumeBefore: v })}
        />
        <UnitField
          label="흡인량 - 후" required unit="L" type="number" step={0.001}
          value={moisture.dryGasVolumeAfter} disabled={!editable}
          onChange={(v) => onChange({ dryGasVolumeAfter: v })}
          helper={<CalcResultRow label="흡인량차이 자동계산" value={display(calc?.vm_g)} unit="L" />}
        />
      </div>
    </SubAccordion>

    <SubAccordion title="게이지압·유속·수분량" defaultOpen>
      <div className={FIELD_GRID}>
        <UnitField
          label="게이지압" required unit="mmH₂O" type="number"
          value={moisture.gasMeterGaugePressure} disabled={!editable}
          onChange={(v) => onChange({ gasMeterGaugePressure: v })}
          helper={
            <>
              <CalcResultRow label="게이지압 환산" value={display(calc?.pm_g)} unit="mmHg" />
              <CalcResultRow label="게이지압 환산" value={display(calc?.pmGInchH2O)} unit="inchH₂O" />
            </>
          }
        />
        <UnitField
          label="흡인유속" required unit="m/s" type="number" step={0.1}
          value={moisture.suctionVelocity} disabled={!editable}
          onChange={(v) => onChange({ suctionVelocity: v })}
          helper={<CalcResultRow label="수분량 자동계산" value={display(calc?.xw)} unit="%" />}
        />
      </div>
    </SubAccordion>

    {/* 수분 채취 시각은 시트별 값이다. 입자상과 달리 지점별 채취시간 합산 개념이 없어 둘 다 직접 입력한다. */}
    <div className={FIELD_GRID}>
      <UnitField
        label="채취 시작시간" type="time" showComplete={false}
        value={moisture.samplingStartTime} disabled={!editable}
        onChange={(v) => onChange({ samplingStartTime: v })}
      />
    </div>
  </SectionAccordion>
);
