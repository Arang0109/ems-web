import { Fragment } from "react";
import { ArrowDownToLine } from "lucide-react";

import type { SheetCalcPreview } from "@entities/schedule";
import { displayValue } from "@shared/lib";
import { SubAccordion } from "@shared/ui/accordion";
import { Badge } from "@shared/ui/badges";
import { Button } from "@shared/ui/buttons";
import { UnitField, CalcResultRow } from "@shared/ui/form";

import { POINT_HINT } from "../../../model/field-hints";
import { fieldPath } from "../../../model/required-fields";
import type { SamplingPointForm } from "../../../model/types";
import { NozzleBasisNote, type NozzleBasis } from "./NozzleBasisNote";
import {
  ISOKINETIC_FIELDS, NOZZLE_BASIS_AFTER, VM_RESULT_AFTER, type PointField,
} from "./point-fields";
import { isokineticResults, vmResult } from "./point-results";
import type { FieldStateProps } from "../shell-props";

interface Props extends FieldStateProps {
  points: SamplingPointForm[];
  preview: SheetCalcPreview | null;
  /** 고른 노즐의 예상 채취시간·채취량 — 채취시간 입력 아래 기준선으로 붙는다 */
  nozzleBasis: NozzleBasis;
  editable: boolean;
  onPointChange: (index: number, patch: Partial<SamplingPointForm>) => void;
  onCopyPreviousPoint: (index: number) => void;
}

/** 지점 카드 안의 그룹 소제목 — 접히지 않는 구분 라벨(피그마의 muted 소제목). */
const GroupLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-label text-ink">{children}</p>
);

/**
 * 모바일 표현 — 지점 하나당 카드 하나. **등속흡인 정보만** 그린다(입자상 전용).
 * 온도·동정압은 `PointFlowTable` 이 카테고리를 가리지 않고 표로 그린다.
 *
 * 데스크탑의 전치 표를 좁은 화면에 그대로 두면 열이 뭉개지므로, 지점을 세로로 편다.
 * 필드 스펙은 `PointTable` 과 같은 소스를 읽는다.
 *
 * 지점 삭제 버튼은 두지 않는다 — 지점 목록의 주인은 `PointFlowTable` 이다.
 * 여기서는 **지점별 값만 그린다** — `측정지점 평균` 은 계산값 드로어가 소유한다. 데스크탑 전치 표는
 * `평균` 열을 유지하는데, 그쪽은 지점 값과 나란한 파생 셀이라 입력을 보며 대조하는 자리다.
 * 여기서는 카드 아래 붙는 독립된 결과 묶음이라 폼에서 떼어 냈다.
 */
export const PointCards = ({
  points, preview, nozzleBasis, editable,
  onPointChange, onCopyPreviousPoint,
  fieldTone, onFieldFocus,
}: Props) => {
  const vm = vmResult(preview);

  // 카드를 접어 둔 채 저장하러 가는 흐름이 흔하므로 칸 안의 빨강을 헤더에도 올린다.
  // 판정은 `fieldTone` 한 곳(저장을 눌렀고 · 필수이고 · 비었다)에서 오므로 여기서 다시 세지 않는다.
  const missingCountOf = (i: number): number =>
    ISOKINETIC_FIELDS.filter((f) => fieldTone(fieldPath.point(i, f.field)) === "danger").length;

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
      {points.map((_, i) => {
        const missing = missingCountOf(i);

        return (
          <SubAccordion
            key={i}
            title={
              <span className="inline-flex items-center gap-2">
                {i + 1} 지점
                {missing > 0 && <Badge tone="danger">미입력 {missing}</Badge>}
              </span>
            }
            defaultOpen={i === 0}
          >
            {/* 앞 지점과 조건이 비슷한 경우가 많아 등속흡인 값을 복사한 뒤 다른 항목만 고치게 한다.
                위 표의 온도·동정압은 지점별로 먼저 적는 값이라 복사하지 않는다 (`point-chain`). */}
            {i > 0 && editable && (
              <Button
                type="button" variant="outline" className="mb-4 w-full"
                onClick={() => onCopyPreviousPoint(i)}
              >
                <ArrowDownToLine size={14} />전 지점 값 불러오기
              </Button>
            )}

            <div className="space-y-3">
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
                        <CalcResultRow label={vm.label} value={displayValue(vm.value(i))} unit="m³" className="col-span-2" />
                        {isokineticResults(preview).map((r) => (
                          <CalcResultRow
                            key={String(r.name)}
                            label={r.label}
                            value={displayValue(r.value(i))}
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
          </SubAccordion>
        );
      })}
    </div>
  );
};
