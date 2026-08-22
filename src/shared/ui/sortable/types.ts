/** `SortableList` 가 항목마다 내려주는 순서 조작 수단. */
export interface SortableControls {
  /**
   * 드래그 핸들에 스프레드할 props.
   * `<Button {...controls.handleProps} />` 처럼 쓴다 — 핸들에만 붙여야 카드 전체가 드래그로 잡히지 않는다.
   */
  handleProps: React.HTMLAttributes<HTMLElement>;
  /** 0-based 위치. 화면의 순위 배지는 `index + 1` 로 그린다. */
  index: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  isDragging: boolean;
  /** 한 칸 위로. `isFirst` 면 호출해도 순서가 바뀌지 않는다. */
  moveUp: () => void;
  /** 한 칸 아래로. `isLast` 면 호출해도 순서가 바뀌지 않는다. */
  moveDown: () => void;
}
