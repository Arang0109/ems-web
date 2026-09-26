interface Props {
  children: React.ReactNode;
}

/**
 * 드래그 중 손가락·커서를 따라다니는 항목 이름표 — `SortableList` 의 `renderOverlay` 에 넣는다.
 *
 * 원래 행을 통째로 복제하면 버튼·입력칸까지 떠다녀 무엇을 옮기는지 오히려 흐려진다.
 * 이름 한 줄만 띄운다. 들어 올린 느낌이 나도록 그림자는 패널보다 깊다.
 */
export const SortableOverlayLabel = ({ children }: Props) => (
  <div className="rounded-icon-tile bg-canvas px-3 py-2.5 text-body-4 text-ink shadow-lg ring-1 ring-rule md:px-4">
    {children}
  </div>
);
