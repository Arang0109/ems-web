import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableItem } from "./SortableItem";
import type { SortableControls } from "./types";

interface Props<T extends { id: number }> {
  items: T[];
  /** 드롭·버튼 조작으로 순서가 바뀔 때. 인덱스만 넘기고 실제 배열 계산은 호출부가 한다. */
  onReorder: (from: number, to: number) => void;
  renderItem: (item: T, controls: SortableControls) => React.ReactNode;
  /**
   * 드래그 중 커서를 따라다닐 축약 미리보기.
   * 원본 카드가 펼쳐진 상태로 클 수 있으므로 헤더만 그리는 것을 권장한다. 생략하면 미리보기가 없다.
   */
  renderOverlay?: (item: T) => React.ReactNode;
  className?: string;
}

/**
 * 세로 방향 드래그 정렬 리스트.
 *
 * 도메인을 모르는 껍데기다 — 항목 모양은 `renderItem` 이 그리고, 순서 저장은 호출부가 한다.
 * 드래그 핸들(`controls.handleProps`)을 붙이지 않으면 어떤 것도 드래그되지 않는다.
 * 카드 본문 전체를 드래그 대상으로 두면 모바일에서 페이지 스크롤이 막히기 때문이다.
 */
export const SortableList = <T extends { id: number }>({
  items,
  onReorder,
  renderItem,
  renderOverlay,
  className,
}: Props<T>) => {
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    // 5px 는 움직여야 드래그로 친다 — 그래야 핸들 위의 단순 탭·클릭과 구분된다
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      const index = items.findIndex((item) => item.id === active.id);
      return `${index + 1}번 항목을 잡았습니다.`;
    },
    onDragOver: ({ over }) => {
      if (!over) return undefined;
      const index = items.findIndex((item) => item.id === over.id);
      return `${index + 1}번 위치로 이동합니다.`;
    },
    onDragEnd: ({ over }) => {
      if (!over) return "순서를 바꾸지 않았습니다.";
      const index = items.findIndex((item) => item.id === over.id);
      return `${index + 1}번으로 옮겼습니다.`;
    },
    onDragCancel: () => "순서 변경을 취소했습니다.",
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over.id);
    if (from === -1 || to === -1) return;

    onReorder(from, to);
  };

  const activeItem = activeId === null ? null : items.find((item) => item.id === activeId) ?? null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{ announcements }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              index={index}
              total={items.length}
              onMove={onReorder}
            >
              {(controls) => renderItem(item, controls)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem && renderOverlay ? renderOverlay(activeItem) : null}
      </DragOverlay>
    </DndContext>
  );
};
