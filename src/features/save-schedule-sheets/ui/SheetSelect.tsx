import { useState } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { measurementCategoryOptions } from "@shared/model";
import type { MeasurementCategory } from "@shared/model";
import { MEASUREMENT_CATEGORY_LABEL } from "@shared/config";
import { Popover } from "@shared/ui/popover";

interface Props {
  /** 기록지들의 카테고리 (기록지 순서대로) */
  sheets: MeasurementCategory[];
  activeIndex: number;
  editable: boolean;
  onSelect: (index: number) => void;
  onAdd: (category: MeasurementCategory) => void;
  onRemove: (index: number, category: MeasurementCategory) => void;
}

const itemClassName = cn(
  "flex h-10 w-full items-center gap-2 rounded-button px-3 text-left text-body-2 text-ink transition-colors md:h-8",
  "hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
);

/**
 * 기록지 셀렉트 — 트리거는 활성 기록지 이름, 펼치면 기록지 전환 · 삭제 · 추가를 한 곳에서 한다.
 *
 * 기록지는 카테고리당 한 장이다(기준선·삭제 목록·동기화가 전부 카테고리를 키로 쓴다).
 * 그래서 추가 목록에는 아직 없는 카테고리만 남기고, 네 장이 다 있으면 추가 묶음 대신 안내를 둔다.
 */
export const SheetSelect = ({ sheets, activeIndex, editable, onSelect, onAdd, onRemove }: Props) => {
  const [open, setOpen] = useState(false);

  const addable = measurementCategoryOptions.filter(({ value }) => !sheets.includes(value));
  const activeCategory = sheets[activeIndex];

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="start"
      className="w-52 p-2"
      content={
        <div className="flex flex-col gap-0.5">
          {sheets.length > 0 && (
            <nav aria-label="기록지" className="flex flex-col gap-0.5">
              {sheets.map((category, index) => {
                const active = index === activeIndex;
                return (
                  <div key={category} className="flex items-center gap-0.5">
                    <button
                      type="button"
                      aria-current={active ? "true" : undefined}
                      onClick={() => run(() => onSelect(index))}
                      className={cn(itemClassName, active && "text-brand-dark")}
                    >
                      <Check size={15} aria-hidden className={cn("shrink-0", !active && "invisible")} />
                      {MEASUREMENT_CATEGORY_LABEL[category]}
                    </button>
                    {editable && (
                      <button
                        type="button"
                        onClick={() => run(() => onRemove(index, category))}
                        aria-label={`${MEASUREMENT_CATEGORY_LABEL[category]} 기록지 삭제`}
                        className="flex size-10 shrink-0 items-center justify-center rounded-button text-muted-ink
                          transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2
                          focus-visible:ring-brand-primary md:size-8"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>
          )}

          {sheets.length === 0 && !editable && (
            <p className="px-3 py-2 text-body-3 text-muted-ink">등록된 기록지가 없습니다.</p>
          )}

          {editable && (
            <div className={cn("flex flex-col gap-0.5", sheets.length > 0 && "mt-1 border-t border-rule pt-1.5")}>
              <p className="px-3 pb-0.5 text-caption text-muted-ink">기록지 추가</p>
              {addable.length > 0 ? (
                addable.map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => run(() => onAdd(value))} className={itemClassName}>
                    <Plus size={15} aria-hidden className="shrink-0 text-brand-primary" />
                    {label}
                  </button>
                ))
              ) : (
                <p className="px-3 py-1.5 text-body-3 text-muted-ink">모든 기록지가 추가되었습니다.</p>
              )}
            </div>
          )}
        </div>
      }
    >
      <button
        type="button"
        aria-label="기록지 선택"
        className={cn(
          "flex h-9 shrink-0 items-center gap-1 rounded-button border border-rule bg-surface pr-2.5 pl-3.25",
          "text-body-4 text-ink outline-none transition-colors hover:border-rule-dark",
          "focus-visible:border-brand-primary focus-visible:ring-3 focus-visible:ring-brand-primary/25",
        )}
      >
        {activeCategory ? MEASUREMENT_CATEGORY_LABEL[activeCategory] : "기록지"}
        <ChevronDown className="size-4.75 text-muted-ink" aria-hidden />
      </button>
    </Popover>
  );
};
