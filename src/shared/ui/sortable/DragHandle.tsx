import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";

import { IconButton } from "../buttons";

interface Props {
  /** `SortableList` 가 내려준 `controls.handleProps` 를 그대로 넘긴다. */
  handleProps: React.HTMLAttributes<HTMLElement>;
  label: string;
  className?: string;
}

/**
 * 드래그 손잡이.
 *
 * `touch-none` 이 핵심이다 — 이게 없으면 모바일에서 손잡이를 잡아도 브라우저가 스크롤로 가로챈다.
 * 반대로 이 클래스를 카드 전체에 걸면 페이지 스크롤이 막히므로 손잡이에만 둔다.
 *
 * dnd-kit 의 포인터·키보드 리스너(`handleProps`)는 `IconButton` 이 `<button>` 까지 그대로 흘려보낸다.
 */
export const DragHandle = ({ handleProps, label, className }: Props) => (
  <IconButton
    size="icon-sm"
    icon={<GripVertical size={16} aria-hidden />}
    label={label}
    {...handleProps}
    className={cn("cursor-grab touch-none text-ink-soft active:cursor-grabbing", className)}
  />
);
