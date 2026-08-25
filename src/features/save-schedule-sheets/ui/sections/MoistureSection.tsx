import { CircleAlert } from "lucide-react";

import type { SheetCalcPreview } from "@entities/schedule";
import { SectionAccordion } from "@shared/ui/accordion";
import { UnitField, CalcResultRow } from "@shared/ui/form";

import { MOISTURE_HINT } from "../../model/field-hints";
import { fieldPath } from "../../model/required-fields";
import type { MoistureForm } from "../../model/types";
import {
  checkMoistureWeightGain, describeMoistureWeightGain, getMoistureWeightGain,
} from "../../model/validator";
import { FIELD_GRID, type FieldStateProps, type SectionShellProps } from "./shell-props";

interface Props extends SectionShellProps, FieldStateProps {
  moisture: MoistureForm;
  calc: SheetCalcPreview["moisture"] | null;
  editable: boolean;
  onChange: (patch: Partial<MoistureForm>) => void;
}

const display = (v: number | null | undefined): string => (v == null ? "-" : String(v));

// "전/후를 입력하면 차이·환산·수분량이 계산된다"는 흐름을 그대로 두 그룹으로 나눈다.
// 온도는 도메인상 건식가스미터 입구/출구 온도라 기록지 용어를 유지한다.
export const MoistureSection = ({
  moisture, calc, editable, onChange, fieldTone, onFieldFocus, ...shell
}: Props) => {
  // 법정 허용 범위를 벗어난 채취는 수분량 산정에 쓸 수 없다. 값을 고쳐 될 일이 아니라 다시
  // 채취해야 하므로, 저장을 막는 대신 입력한 자리에서 바로 알린다.
  const weightIssue = checkMoistureWeightGain(moisture);
  const weightGain = getMoistureWeightGain(moisture);

  return (
    <SectionAccordion
      {...shell}
      title="수분량 계산"
      subtitle="측정값을 바탕으로 배출가스의 수분량을 계산합니다."
    >
      {/* 수분 채취 시각은 시트별 값이다. 입자상과 달리 지점별 채취시간 합산 개념이 없어 둘 다 직접 입력한다. */}
      <div className={FIELD_GRID}>
        <UnitField
          label="채취 시작시간" type="time" showComplete={false}
          value={moisture.samplingStartTime} disabled={!editable}
          tone={fieldTone(fieldPath.moisture("samplingStartTime"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("samplingStartTime"))}
          onChange={(v) => onChange({ samplingStartTime: v })}
        />
      </div>
      <div className={FIELD_GRID}>
        <UnitField
          label="흡습병 무게 - 전" required unit="g" type="number" min={0} step={0.01}
          hint={MOISTURE_HINT.weight}
          value={moisture.weightBefore} disabled={!editable}
          tone={weightIssue ? "danger" : fieldTone(fieldPath.moisture("weightBefore"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("weightBefore"))}
          onChange={(v) => onChange({ weightBefore: v })}
        />
        <UnitField
          label="흡습병 무게 - 후" required unit="g" type="number" min={0} step={0.01}
          value={moisture.weightAfter} disabled={!editable}
          onFocus={() => onFieldFocus(fieldPath.moisture("weightAfter"))}
          onChange={(v) => onChange({ weightAfter: v })}
          tone={weightIssue ? "danger" : fieldTone(fieldPath.moisture("weightAfter"))}
          helper={
            <>
              <CalcResultRow label="흡습된 수분무게 : ma(g)" value={display(calc?.ma)} unit="g" />
              {weightIssue && weightGain !== null && (
                <p className="flex items-start gap-1 text-label text-danger">
                  <CircleAlert size={13} className="mt-0.5 shrink-0" aria-hidden />
                  {describeMoistureWeightGain(weightIssue, weightGain)}
                </p>
              )}
            </>
          }
        />
        <UnitField
          label="온도 - 입구" required unit="°C" type="number" step={0.1}
          hint={MOISTURE_HINT.gasMeterTemp}
          value={moisture.gasMeterTempIn} disabled={!editable}
          tone={fieldTone(fieldPath.moisture("gasMeterTempIn"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("gasMeterTempIn"))}
          onChange={(v) => onChange({ gasMeterTempIn: v })}
        />
        <UnitField
          label="온도 - 출구" required unit="°C" type="number" step={0.1}
          value={moisture.gasMeterTempOut} disabled={!editable}
          tone={fieldTone(fieldPath.moisture("gasMeterTempOut"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("gasMeterTempOut"))}
          onChange={(v) => onChange({ gasMeterTempOut: v })}
          helper={<CalcResultRow label="평균온도 : Tm(°C)" value={display(calc?.tm_g)} unit="°C" />}
        />
        <UnitField
          label="흡인량 - 전" required unit="L" type="number" min={0} step={0.001}
          hint={MOISTURE_HINT.dryGasVolume}
          value={moisture.dryGasVolumeBefore} disabled={!editable}
          tone={fieldTone(fieldPath.moisture("dryGasVolumeBefore"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("dryGasVolumeBefore"))}
          onChange={(v) => onChange({ dryGasVolumeBefore: v })}
        />
        <UnitField
          label="흡인량 - 후" required unit="L" type="number" min={0} step={0.001}
          value={moisture.dryGasVolumeAfter} disabled={!editable}
          tone={fieldTone(fieldPath.moisture("dryGasVolumeAfter"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("dryGasVolumeAfter"))}
          onChange={(v) => onChange({ dryGasVolumeAfter: v })}
          helper={<CalcResultRow label="흡인량 : Vm(L)" value={display(calc?.vm_g)} unit="L" />}
        />
        <UnitField
          label="게이지압" required unit="mmH₂O" type="number" min={0}
          hint={MOISTURE_HINT.gaugePressure}
          value={moisture.gasMeterGaugePressure} disabled={!editable}
          tone={fieldTone(fieldPath.moisture("gasMeterGaugePressure"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("gasMeterGaugePressure"))}
          onChange={(v) => onChange({ gasMeterGaugePressure: v })}
          helper={
            <>
              <CalcResultRow label="게이지압 : Pg(mmHg)" value={display(calc?.pm_g)} unit="mmHg" />
              <CalcResultRow label="게이지압 : Pg(inchH₂O)" value={display(calc?.pmGInchH2O)} unit="inchH₂O" />
            </>
          }
        />
        <UnitField
          label="흡인유속" required unit="L/min" type="number" min={0} step={0.1}
          hint={MOISTURE_HINT.suctionVelocity}
          value={moisture.suctionVelocity} disabled={!editable}
          tone={fieldTone(fieldPath.moisture("suctionVelocity"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("suctionVelocity"))}
          onChange={(v) => onChange({ suctionVelocity: v })}
          helper={<CalcResultRow label="수분량 : Xw(%)" value={display(calc?.xw)} unit="%" />}
        />
      </div>
    </SectionAccordion>
  );
};
