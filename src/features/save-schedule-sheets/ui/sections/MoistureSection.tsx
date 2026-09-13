import { CircleAlert } from "lucide-react";
import { useIsMobile } from "@shared/model";

import type { SheetCalcPreview } from "@entities/schedule";
import { SectionAccordion } from "@shared/ui/accordion";
import { UnitField, CalcResultRow } from "@shared/ui/form";

import { MOISTURE_HINT } from "../../model/field-hints";
import { fieldPath } from "../../model/required-fields";
import type { MoistureForm } from "../../model/types";
import {
  checkMoistureWeightGain, describeMoistureWeightGain, getMoistureWeightGain,
} from "../../model/validator";
import type { FieldStateProps, SectionShellProps } from "./shell-props";
import { Divider } from "@/shared/ui/borders/Divider";

interface Props extends SectionShellProps, FieldStateProps {
  moisture: MoistureForm;
  calc: SheetCalcPreview["moisture"] | null;
  editable: boolean;
  onChange: (patch: Partial<MoistureForm>) => void;
}

const display = (v: number | null | undefined): string => (v == null ? "-" : String(v));

/*
 * 칸별 자릿수 근거 (`maxIntDigits`/`maxDecimals`) — 계측기의 표시 범위에서 따온다.
 *
 * - 흡습병 무게 4/2 : 저울 용량은 수 kg, 눈금은 0.01g
 * - DGM 온도    3/1 : 외기~수백 °C. 부호는 자릿수에 세지 않는다
 * - 흡인량      6/3 : 가스미터 적산계가 6자리, 눈금 0.001L
 * - 게이지압    3/1 : 굴뚝 게이지압은 수십 mmH₂O
 * - 흡인 유속   3/1 : 채취 펌프 유량은 수 L/min
 */

// "전/후를 입력하면 차이·환산·수분량이 계산된다"는 흐름을 그대로 두 그룹으로 나눈다.
// 온도는 도메인상 건식가스미터 입구/출구 온도라 기록지 용어를 유지한다.
export const MoistureSection = ({
  moisture, calc, editable, onChange, fieldTone, onFieldFocus, ...shell
}: Props) => {
  // 법정 허용 범위를 벗어난 채취는 수분량 산정에 쓸 수 없다. 값을 고쳐 될 일이 아니라 다시
  // 채취해야 하므로, 저장을 막는 대신 입력한 자리에서 바로 알린다.
  const weightIssue = checkMoistureWeightGain(moisture);
  const weightGain = getMoistureWeightGain(moisture);
  
  const isMobile = useIsMobile();

  return (
    <SectionAccordion
      {...shell}
      title="수분량 계산"
      subtitle="배출가스의 수분량을 계산합니다."
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <UnitField
          label="흡습병 무게 - 전" unit="g" type="number" min={0} step={0.01}
          maxIntDigits={4} maxDecimals={2}
          value={moisture.weightBefore} disabled={!editable}
          tone={weightIssue ? "danger" : fieldTone(fieldPath.moisture("weightBefore"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("weightBefore"))}
          onChange={(v) => onChange({ weightBefore: v })}
        />
        <UnitField
          label="흡습병 무게 - 후" unit="g" type="number" min={0} step={0.01}
          maxIntDigits={4} maxDecimals={2}
          value={moisture.weightAfter} disabled={!editable}
          onFocus={() => onFieldFocus(fieldPath.moisture("weightAfter"))}
          onChange={(v) => onChange({ weightAfter: v })}
          tone={weightIssue ? "danger" : fieldTone(fieldPath.moisture("weightAfter"))}
        />
        {isMobile ? (
        <>
          <CalcResultRow
            label="흡습된 수분무게 (ma) :"
            value={display(calc?.ma)}
            unit="g"
            className="col-span-2"
          />

          {weightIssue && weightGain !== null && (
            <p className="flex items-start gap-1 text-label text-danger">
              <CircleAlert
                size={13}
                className="mt-0.5 shrink-0"
                aria-hidden
              />
              {describeMoistureWeightGain(weightIssue, weightGain)}
            </p>
          )}
        </>
        ) : (
        <UnitField
          label="흡습된 수분무게"
          unit="g"
          readOnly
          value={display(calc?.ma)}
        />)}
        <UnitField
          label="온도 - 입구" unit="°C" type="number" step={0.1}
          maxIntDigits={3} maxDecimals={1}
          value={moisture.gasMeterTempIn} disabled={!editable}
          tone={fieldTone(fieldPath.moisture("gasMeterTempIn"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("gasMeterTempIn"))}
          onChange={(v) => onChange({ gasMeterTempIn: v })}
        />
        <UnitField
          label="온도 - 출구" unit="°C" type="number" step={0.1}
          maxIntDigits={3} maxDecimals={1}
          value={moisture.gasMeterTempOut} disabled={!editable}
          tone={fieldTone(fieldPath.moisture("gasMeterTempOut"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("gasMeterTempOut"))}
          onChange={(v) => onChange({ gasMeterTempOut: v })}
        />
        {isMobile ? (
        <>
          <CalcResultRow
            label="평균온도 (Tm) :"
            value={display(calc?.tm_g)}
            unit="°C"
            className="col-span-2"
          />

          {weightIssue && weightGain !== null && (
            <p className="flex items-start gap-1 text-label text-danger">
              <CircleAlert
                size={13}
                className="mt-0.5 shrink-0"
                aria-hidden
              />
              {describeMoistureWeightGain(weightIssue, weightGain)}
            </p>
          )}
        </>
        ) : (
        <UnitField
          label="평균온도"
          unit="°C"
          readOnly
          value={display(calc?.tm_g)}
        />)}

        <UnitField
          label="흡인량 - 전" unit="L" type="number" min={0} step={0.001}
          maxIntDigits={6} maxDecimals={3}
          value={moisture.dryGasVolumeBefore} disabled={!editable}
          tone={fieldTone(fieldPath.moisture("dryGasVolumeBefore"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("dryGasVolumeBefore"))}
          onChange={(v) => onChange({ dryGasVolumeBefore: v })}
        />
        <UnitField
          label="흡인량 - 후" unit="L" type="number" min={0} step={0.001}
          maxIntDigits={6} maxDecimals={3}
          value={moisture.dryGasVolumeAfter} disabled={!editable}
          tone={fieldTone(fieldPath.moisture("dryGasVolumeAfter"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("dryGasVolumeAfter"))}
          onChange={(v) => onChange({ dryGasVolumeAfter: v })}
        />
        {isMobile ? (
        <>
          <CalcResultRow
            label="흡인량 : (Vm) :"
            value={display(calc?.vm_g)}
            unit="L"
            className="col-span-2"
          />

          {weightIssue && weightGain !== null && (
            <p className="flex items-start gap-1 text-label text-danger">
              <CircleAlert
                size={13}
                className="mt-0.5 shrink-0"
                aria-hidden
              />
              {describeMoistureWeightGain(weightIssue, weightGain)}
            </p>
          )}
        </>
        ) : (
        <UnitField
          label="흡인량"
          unit="L"
          readOnly
          value={display(calc?.vm_g)}
        />)}
      </div>
      {isMobile && <Divider />}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <UnitField
          label="게이지압" unit="mmH₂O" type="number" min={0}
          maxIntDigits={3} maxDecimals={1}
          hint={MOISTURE_HINT.gaugePressure}
          value={moisture.gasMeterGaugePressure} disabled={!editable}
          tone={fieldTone(fieldPath.moisture("gasMeterGaugePressure"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("gasMeterGaugePressure"))}
          onChange={(v) => onChange({ gasMeterGaugePressure: v })}
        />
        <div className="flex flex-col justify-center gap-1">
          <CalcResultRow label="Pg(mmHg)" value={display(calc?.pm_g)} unit="mmHg" />
          <CalcResultRow label="Pg(inchH₂O)" value={display(calc?.pmGInchH2O)} unit="inchH₂O" />
        </div>
        <UnitField
          label="흡인 유속" unit="L/min" type="number" min={0} step={0.1}
          maxIntDigits={3} maxDecimals={1}
          hint={MOISTURE_HINT.suctionVelocity}
          value={moisture.suctionVelocity} disabled={!editable}
          tone={fieldTone(fieldPath.moisture("suctionVelocity"))}
          onFocus={() => onFieldFocus(fieldPath.moisture("suctionVelocity"))}
          onChange={(v) => onChange({ suctionVelocity: v })}
        />
        <div className="flex flex-col justify-center gap-1">
          <CalcResultRow label="수분량 : Xw(%)" value={display(calc?.xw)} unit="%" />
        </div>
      </div>
    </SectionAccordion>
  );
};
