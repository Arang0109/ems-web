import { DragHandle } from "ems-web";

/**
 * 드래그 손잡이. 실제로는 `SortableList` 가 내려준 `controls.handleProps` 를
 * 그대로 넘긴다 — 정지 화면에서는 빈 객체로 모양만 보인다.
 */
export const Default = () => (
  <div className="flex items-center gap-2">
    <DragHandle handleProps={{}} label="순서 변경 손잡이" />
    <span className="text-body-1">1호기 보일러</span>
  </div>
);

/** 정렬 가능한 목록 행에서의 실제 조합 — 손잡이 + 순위 + 제목 */
export const InSortableRow = () => (
  <div className="flex flex-col">
    {["1호기 보일러", "2호기 소각로", "3호기 건조로"].map((name, i) => (
      <div key={name} className="flex items-center gap-2 border-b border-rule p-3">
        <DragHandle handleProps={{}} label={`${name} 순서 변경 손잡이`} />
        <span className="w-4 text-center text-caption text-ink-soft tabular-nums">{i + 1}</span>
        <span className="text-body-1">{name}</span>
      </div>
    ))}
  </div>
);
