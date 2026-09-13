import { Fragment } from "react";
import { ArrowDownToLine, X } from "lucide-react";

import type { SheetCalcPreview } from "@entities/schedule";
import { SubAccordion } from "@shared/ui/accordion";
import { Button, IconButton } from "@shared/ui/buttons";
import { UnitField, CalcResultRow } from "@shared/ui/form";

import { POINT_HINT } from "../../../model/field-hints";
import { fieldPath } from "../../../model/required-fields";
import type { SamplingPointForm } from "../../../model/types";
import { NozzleBasisNote, type NozzleBasis } from "./NozzleBasisNote";
import {
  FLOW_FIELDS, ISOKINETIC_FIELDS, NOZZLE_BASIS_AFTER, VM_RESULT_AFTER, type PointField,
} from "./point-fields";
import { display, isokineticResults, vmResult } from "./point-results";
import type { FieldStateProps } from "../shell-props";

interface Props extends FieldStateProps {
  isParticle: boolean;
  points: SamplingPointForm[];
  preview: SheetCalcPreview | null;
  /** 고른 노즐의 예상 채취시간·채취량 — 채취시간 입력 아래 기준선으로 붙는다 */
  nozzleBasis: NozzleBasis;
  editable: boolean;
  onPointChange: (index: number, patch: Partial<SamplingPointForm>) => void;
  onRemovePoint: (index: number) => void;
  onCopyPreviousPoint: (index: number) => void;
}

/** 지점 카드 안의 그룹 소제목 — 접히지 않는 구분 라벨(피그마의 muted 소제목). */
const GroupLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-label text-ink">{children}</p>
);

/**
 * 모바일 표현 — 지점 하나당 카드 하나.
 *
 * 데스크탑의 전치 표를 좁은 화면에 그대로 두면 열이 뭉개지므로, 지점을 세로로 편다.
 * 그룹 순서(유량 → 등속흡인)와 필드 스펙은 `PointTable` 과 같은 소스를 읽는다.
 *
 * **지점별 값만 그린다** — `측정지점 평균` 은 계산값 드로어가 소유한다. 데스크탑 전치 표는
 * `평균` 열을 유지하는데, 그쪽은 지점 값과 나란한 파생 셀이라 입력을 보며 대조하는 자리다.
 * 여기서는 카드 아래 붙는 독립된 결과 묶음이라 폼에서 떼어 냈다.
 */
export const PointCards = ({
  isParticle, points, preview, nozzleBasis, editable,
  onPointChange, onRemovePoint, onCopyPreviousPoint,
  fieldTone, onFieldFocus,
}: Props) => {
  const vm = vmResult(preview);

  const inputField = (f: PointField, i: number) => (
    <UnitField
      key={String(f.field)}
      label={f.label} unit={f.unit} type="number" min={f.min} step={f.step}
      maxIntDigits={f.maxIntDigits} maxDecimals={f.maxDecimals}
      hint={POINT_HINT[f.field]}
      hintLabel={`${f.name} 설명`}
      value={points[i][f.field]} disabled={!editable}
      tone={fieldTone(fieldPath.point(i, f.field))}
      onFocus={() => onFieldFocus(fieldPath.point(i, f.field))}
      onChange={(v) => onPointChange(i, { [f.field]: v })}
      className={f.className}
    />
  );

  return (
    <div className="space-y-3 md:hidden">
      {points.map((_, i) => (
        <SubAccordion
          key={i}
          title={`${i + 1} 지점`}
          defaultOpen={i === 0}
          action={
            editable && points.length > 1 ? (
              <IconButton
                variant="ghost" size="icon-sm" label={`${i + 1}지점 삭제`}
                icon={<X size={16} />}
                onClick={() => onRemovePoint(i)}
              />
            ) : undefined
          }
        >
          {/* 앞 지점과 조건이 비슷한 경우가 많아 값을 통째로 복사한 뒤 다른 항목만 고치게 한다. */}
          {i > 0 && editable && (
            <Button
              type="button" variant="outline" className="mb-4 w-full"
              onClick={() => onCopyPreviousPoint(i)}
            >
              <ArrowDownToLine size={14} />전 지점 값 불러오기
            </Button>
          )}

          <div className="space-y-3">
            <GroupLabel>배출가스의 온도, 동·정압 정보</GroupLabel>
            <div className="grid grid-cols-2 gap-3">
              {FLOW_FIELDS.map((f) => inputField(f, i))}
            </div>
          </div>

          {isParticle && (
            <div className="mt-4 space-y-3 border-t border-rule pt-4">
              <GroupLabel>등속흡인 정보</GroupLabel>
              <div className="grid grid-cols-2 gap-3">
                {/* 채취량은 입력이 아니라 결과지만 시안의 기입 순서상 입력 사이에 온다 */}
                {ISOKINETIC_FIELDS.map((f) => (
                  <Fragment key={String(f.field)}>
                    {inputField(f, i)}
                    {/* 채취량을 적어 넣기 전에 목표치를 보게 한다 — 지점별 값이 아니라 시트 공통 기준이다 */}
                    {f.field === NOZZLE_BASIS_AFTER && (
                      <NozzleBasisNote basis={nozzleBasis} className="col-span-2" />
                    )}
                    {f.field === VM_RESULT_AFTER && (
                      <>
                        <CalcResultRow label={vm.label} value={display(vm.value(i))} unit="m³" className="col-span-2" />
                        {isokineticResults(preview).map((r) => (
                          <CalcResultRow
                            key={String(r.name)}
                            label={r.label}
                            value={display(r.value(i))}
                            unit={r.unit}
                            className="col-span-2"
                          />
                        ))}
                      </>
                    )}
                  </Fragment>
                ))}
              </div>

              
            </div>
          )}
        </SubAccordion>
      ))}
    </div>
  );
};
