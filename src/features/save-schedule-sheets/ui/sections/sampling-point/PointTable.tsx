import { Fragment } from "react";
import { ArrowDownToLine, X } from "lucide-react";

import type { SheetCalcPreview } from "@entities/schedule";
import { useGridNavigation } from "@shared/model";
import { TableLabelCell, TableInputCell, TableResultCell } from "@shared/ui/table";

import { POINT_HINT } from "../../../model/field-hints";
import { fieldPath } from "../../../model/required-fields";
import type { SamplingPointForm } from "../../../model/types";
import { averageOf, display, type PointGroup } from "./point-results";
import type { FieldStateProps } from "../shell-props";

interface Props extends FieldStateProps {
  points: SamplingPointForm[];
  preview: SheetCalcPreview | null;
  groups: PointGroup[];
  editable: boolean;
  onPointChange: (index: number, patch: Partial<SamplingPointForm>) => void;
  onRemovePoint: (index: number) => void;
  onCopyPreviousPoint: (index: number) => void;
}

/** 지점 열 + 평균 열의 최소 폭 (px) — 라벨 열은 별도로 180px 를 잡는다 */
const COLUMN_WIDTH = 90;
const LABEL_WIDTH = 180;

/**
 * 데스크탑 표현 — 행=항목, 열=지점인 전치 표.
 *
 * 다열 그리드로 펴지 않는 이유는 "지점 간 값 비교" 가 이 표의 목적이기 때문이다.
 * 항목별 입력 스펙(단위·하한·증감폭)은 `PointCards` 와 같은 `PointField` 를 읽는다.
 */
export const PointTable = ({
  points, preview, groups, editable, onPointChange, onRemovePoint, onCopyPreviousPoint,
  fieldTone, onFieldFocus,
}: Props) => {
  const wide = points.length + 1;   // 지점 열 + 평균 열 (라벨 제외)
  // 열이 지점 수만큼 늘어나는 전치 표라 `InputTable` 로 조립하지 않는다 — 셀 간 이동만 공유한다
  const gridNav = useGridNavigation();

  return (
    <div {...gridNav} className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse" style={{ minWidth: `${LABEL_WIDTH + wide * COLUMN_WIDTH}px` }}>
        <tbody>
          <tr>
            <TableLabelCell>측정점</TableLabelCell>
            {points.map((_, i) => (
              <TableLabelCell key={i} scope="col">
                <span className="inline-flex items-center gap-1">
                  {i + 1} 지점
                  {editable && i > 0 && (
                    <button type="button" onClick={() => onCopyPreviousPoint(i)}
                      className="text-muted-ink hover:text-brand-primary" aria-label={`${i + 1}지점에 전 지점 값 불러오기`}>
                      <ArrowDownToLine size={12} />
                    </button>
                  )}
                  {editable && points.length > 1 && (
                    <button type="button" onClick={() => onRemovePoint(i)}
                      className="text-muted-ink hover:text-danger" aria-label={`${i + 1}지점 삭제`}>
                      <X size={12} />
                    </button>
                  )}
                </span>
              </TableLabelCell>
            ))}
            <TableLabelCell>평균</TableLabelCell>
          </tr>

          {groups.map((group) => (
            <Fragment key={group.label}>
              <tr>
                <th scope="colgroup" colSpan={wide + 1}
                  className="bg-canvas border border-rule px-2 py-1 text-left text-label text-muted-ink">
                  {group.label}
                </th>
              </tr>

              {group.fields.map((f) => (
                <tr key={String(f.field)}>
                  <TableLabelCell hint={POINT_HINT[f.field]} hintLabel={`${f.name} 설명`}>
                    {f.label} ({f.unit})
                  </TableLabelCell>
                  {points.map((p, i) => (
                    <TableInputCell key={i} type="number" value={p[f.field]} unit={f.unit}
                      min={f.min} step={f.step}
                      tone={fieldTone(fieldPath.point(i, f.field))}
                      onFocus={() => onFieldFocus(fieldPath.point(i, f.field))}
                      onChange={(v) => onPointChange(i, { [f.field]: v })} disabled={!editable} />
                  ))}
                  <TableResultCell value={display(averageOf(f.field, points, preview))} />
                </tr>
              ))}

              {group.results.map((r, ri) => (
                <tr key={ri}>
                  <TableLabelCell hint={r.hint} hintLabel={`${r.name} 설명`}>{r.label}</TableLabelCell>
                  {points.map((_, i) => (
                    <TableResultCell key={i} value={display(r.value(i))} />
                  ))}
                  <TableResultCell value={display(r.avg)} />
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
