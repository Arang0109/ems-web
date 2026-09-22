import { useState } from "react";

import { cn } from "@/lib/utils";
import { measurementCategoryOptions } from "@shared/model";
import type { MeasurementCategory } from "@shared/model";
import { Button } from "@shared/ui/buttons";
import { Popover } from "@shared/ui/popover";

interface Props {
  /** 이미 추가된 카테고리 — 목록에서 비활성으로 남는다 */
  existing: MeasurementCategory[];
  onAdd: (category: MeasurementCategory) => void;
}

/**
 * 기록지 추가 — `+` 를 누르면 카테고리 목록이 뜨고, 고르는 즉시 추가된다.
 *
 * 기록지는 카테고리당 한 장이다(기준선·삭제 목록·동기화가 전부 카테고리를 키로 쓴다).
 * 그래서 이미 있는 카테고리는 목록에서 고를 수 없게 두고, 네 장이 다 있으면 `+` 자체를 잠근다.
 */
export const AddSheetPopover = ({ existing, onAdd }: Props) => {
  const [open, setOpen] = useState(false);

  const isAllAdded = measurementCategoryOptions.every(({ value }) => existing.includes(value));

  const handlePick = (category: MeasurementCategory) => {
    onAdd(category);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="end"
      className="w-44 p-2"
      content={
        <div role="listbox" aria-label="추가할 기록지" className="flex flex-col gap-0.5">
          {measurementCategoryOptions.map(({ value, label }) => {
            const isAdded = existing.includes(value);
            return (
              <button
                key={value}
                type="button"
                role="option"
                aria-selected={false}
                disabled={isAdded}
                onClick={() => handlePick(value)}
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-button px-3 text-body-2 text-ink transition-colors md:h-8",
                  "hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
                  "disabled:cursor-not-allowed disabled:text-muted-ink disabled:hover:bg-transparent",
                )}
              >
                {label}
                {isAdded && <span className="text-caption text-muted-ink">추가됨</span>}
              </button>
            );
          })}
        </div>
      }
    >
      <Button
        variant="default"
        aria-label="기록지 추가"
        disabled={isAllAdded}
        title={isAllAdded ? "모든 기록지가 추가되었습니다" : undefined}
      >
        기록지 추가
      </Button>
    </Popover>
  );
};
