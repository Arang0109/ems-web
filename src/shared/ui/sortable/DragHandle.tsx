import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "../buttons";

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
 * `IconButton` 이 아니라 `Button` 을 쓰는 이유는 dnd-kit 의 포인터·키보드 리스너를
 * 스프레드해야 하는데 `IconButton` 은 `onClick` 만 받기 때문이다.
 */
export const DragHandle = ({ handleProps, label, className }: Props) => (
  <Button
    variant="ghost"
    size="icon-sm"
    aria-label={label}
    {...handleProps}
    className={cn("cursor-grab touch-none text-ink-soft active:cursor-grabbing", className)}
  >
    <GripVertical size={16} aria-hidden />
  </Button>
);
