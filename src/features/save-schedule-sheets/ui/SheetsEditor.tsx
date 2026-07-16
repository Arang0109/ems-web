import { useState } from "react";
import { Plus, X } from "lucide-react";

import type { MeasurementSheet } from "@entities/schedule";
import { measurementCategoryOptions } from "@shared/model";
import type { MeasurementCategory } from "@shared/model";
import { MEASUREMENT_CATEGORY_LABEL } from "@shared/config";
import { Select } from "@shared/ui/form";
import { Button } from "@shared/ui/buttons";

import { useSaveSheets } from "../model/hooks/use-save-sheets";
import { SheetFormView } from "./SheetFormView";

interface Props {
  scheduleId: number | null;
  initialSheets: MeasurementSheet[];
  editable: boolean;
  onSaved?: () => void;
}

export const SheetsEditor = ({ scheduleId, initialSheets, editable, onSaved }: Props) => {
  const {
    sheets, activeIndex, activeSheet, activeCalcSheet, isLoading,
    setActiveIndex, addSheet, removeSheet, updateActiveSheet, handleSave,
  } = useSaveSheets({ scheduleId, initialSheets, editable, onSaved });

  const [newCategory, setNewCategory] = useState<MeasurementCategory>("GAS");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {sheets.map((sheet, index) => (
            <div
              key={index}
              className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                index === activeIndex
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <button type="button" onClick={() => setActiveIndex(index)}>
                {MEASUREMENT_CATEGORY_LABEL[sheet.category]}
              </button>
              {editable && (
                <button type="button" onClick={() => removeSheet(index)} className="text-muted-foreground hover:text-destructive">
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
          {sheets.length === 0 && (
            <span className="text-sm text-muted-foreground">등록된 기록지가 없습니다.</span>
          )}
        </div>

        {editable && (
          <div className="flex items-center gap-2">
            <Select
              className="w-32"
              value={newCategory}
              options={measurementCategoryOptions}
              onValueChange={(v) => setNewCategory((v ?? "GAS") as MeasurementCategory)}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => addSheet(newCategory)}>
              <Plus size={14} className="mr-1" />기록지 추가
            </Button>
          </div>
        )}
      </div>

      {activeSheet ? (
        <>
          <SheetFormView
            key={activeIndex}
            sheet={activeSheet}
            calcSheet={activeCalcSheet}
            editable={editable}
            onChange={updateActiveSheet}
          />
          {editable && (
            <div className="flex justify-end pt-2">
              <Button type="button" onClick={handleSave} disabled={isLoading || scheduleId == null}>
                {isLoading ? "저장 중..." : "측정 데이터 저장"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          {editable ? "기록지를 추가하여 측정 데이터를 입력하세요." : "입력된 측정 데이터가 없습니다."}
        </p>
      )}

      {!editable && (
        <p className="text-xs text-muted-foreground">
          완료 또는 취소된 측정계획은 측정 데이터를 수정할 수 없습니다.
        </p>
      )}
    </div>
  );
};
