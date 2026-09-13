import { Trash2 } from "lucide-react";

import { IconButton } from "@shared/ui/buttons";
import { useConfirm } from "@shared/ui/dialogs";
import { InputTable, type InputTableColumn } from "@shared/ui/table";

import { POINT_HINT } from "../../../model/field-hints";
import { fieldPath } from "../../../model/required-fields";
import type { SamplingPointForm } from "../../../model/types";
import { FLOW_FIELDS } from "./point-fields";
import type { FieldStateProps } from "../shell-props";

interface Props extends FieldStateProps {
  points: SamplingPointForm[];
  editable: boolean;
  onPointChange: (index: number, patch: Partial<SamplingPointForm>) => void;
  onRemovePoint: (index: number) => void;
}

/**
 * 지점 이름 열 · 값 열 · 삭제 열의 폭 (px).
 * 표를 `fit` 으로 세우므로 고정 폭이 아니라 **열 간 비율**이다.
 */
const LABEL_WIDTH = 30;
const VALUE_WIDTH = 60;
const ACTION_WIDTH = 25;

/**
 * 지점별 배출가스 온도·동정압 — 행=지점, 열=온도·동압·정압인 표.
 *
 * 현장에서는 **모든 지점의 온도·동정압을 먼저 재고 나서** 채취를 시작한다. 그래서 등속흡인
 * 입력(카드·전치 표)과 섞지 않고 `배출가스 정보` 처럼 표 하나로 따로 세운다 — 이 칸들을 읽는
 * 목적이 "지점 간 값 비교" 라서 한눈에 훑을 수 있어야 한다.
 *
 * 열이 5개(지점 + 3 + 삭제)뿐이라 모바일에서도 같은 표를 쓴다 (`fit`). 평균 행은 두지 않는다 —
 * 측정지점 평균은 계산값 드로어가 소유한다.
 *
 * 지점 목록의 주인은 이 표다 — **지점 삭제는 여기서만** 한다. 가스상 기록지는 등속흡인 표현이
 * 없어 이 표가 지점 조작의 유일한 자리이기도 하다.
 * 항목 스펙은 `point-fields` 의 `FLOW_FIELDS` 를 읽는다.
 */
export const PointFlowTable = ({
  points, editable, onPointChange, onRemovePoint, fieldTone, onFieldFocus,
}: Props) => {
  const confirm = useConfirm();

  // 온도·동정압뿐 아니라 등속흡인 값까지 한 지점이 통째로 사라진다 — 기록지 삭제와 같은 확인을 거친다.
  const handleRemove = async (index: number) => {
    const isConfirmed = await confirm({
      title: "측정점 삭제",
      description: `${index + 1}지점을 삭제합니다. 입력한 지점 값이 사라집니다.`,
      confirmLabel: "삭제",
      tone: "danger",
    });
    if (isConfirmed) onRemovePoint(index);
  };

  const columns: InputTableColumn<SamplingPointForm>[] = [
    { kind: "label", header: "지점", width: LABEL_WIDTH, render: (_, i) => `${i + 1}` },

    ...FLOW_FIELDS.map((f): InputTableColumn<SamplingPointForm> => ({
      kind: "input",
      header: <>{f.label}</>,
      hint: POINT_HINT[f.field],
      hintLabel: `${f.name} 설명`,
      width: f.field === "Pv" ? 50 : VALUE_WIDTH,
      type: "number",
      min: f.min,
      step: f.step,
      maxIntDigits: f.maxIntDigits,
      maxDecimals: f.maxDecimals,
      value: (p) => p[f.field],
      tone: (_, i) => fieldTone(fieldPath.point(i, f.field)),
      onFocus: (_, i) => onFieldFocus(fieldPath.point(i, f.field)),
      onChange: (_, v, i) => onPointChange(i, { [f.field]: v }),
    })),

    {
      kind: "action", header: "", width: ACTION_WIDTH,
      // 마지막 한 지점은 지울 수 없다 — 지점이 0개인 기록지는 성립하지 않는다
      render: (_, i) => points.length > 1 ? (
        <IconButton
          variant="ghost" size="icon-sm" label={`${i + 1}지점 삭제`}
          icon={<Trash2 size={14} />}
          onClick={() => handleRemove(i)}
          className="text-danger"
        />
      ) : null,
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-label text-ink">측정지점의 배출가스 온도, 동·정압 정보</p>
      <InputTable
        fit
        rows={points}
        columns={columns}
        getRowKey={(_, i) => i}
        editable={editable}
      />
    </div>
  );
};
