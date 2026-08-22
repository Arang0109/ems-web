import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";

import type { SortableControls } from "./types";

interface Props {
  id: number;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  children: (controls: SortableControls) => React.ReactNode;
}

/**
 * `SortableList` 의 항목 하나. 드래그 역학은 dnd-kit 에 맡기고,
 * 실제 카드 모양은 호출부가 `children(controls)` 로 그린다.
 */
export const SortableItem = ({ id, index, total, onMove, children }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const controls: SortableControls = {
    // 핸들에 그대로 스프레드한다. `Button` 은 button 의 DOM props 를 그대로 넘겨받으므로 바로 붙는다.
    handleProps: { ...attributes, ...listeners },
    index,
    total,
    isFirst: index === 0,
    isLast: index === total - 1,
    isDragging,
    moveUp: () => onMove(index, index - 1),
    moveDown: () => onMove(index, index + 1),
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      // 드래그 중인 원본은 흐리게 두고, 실제 미리보기는 DragOverlay 가 그린다
      className={cn(isDragging && "opacity-40")}
    >
      {children(controls)}
    </div>
  );
};
