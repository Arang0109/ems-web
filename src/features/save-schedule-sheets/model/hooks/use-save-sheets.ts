import { useState } from "react";

import type { MeasurementSheet } from "@entities/schedule";
import { useSaveSheetsAction } from "@entities/schedule";
import type { MeasurementCategory } from "@shared/model";
import { toast } from "@shared/ui/toasts";

import type { SheetForm } from "../types";
import { getDefaultSheetForm } from "../types";
import { toSheetSave, fromSheet } from "../mapper";
import { validateSheetFields } from "../validator";

interface Params {
  scheduleId: number | null;
  initialSheets: MeasurementSheet[];
  editable: boolean;
  onSaved?: () => void;
}

// 측정계획의 전체 시트 세트를 관리한다. 서버 PUT은 시트 전체 교체이므로 일괄 저장한다.
export const useSaveSheets = ({ scheduleId, initialSheets, editable, onSaved }: Params) => {
  const { saveSheets, isLoading } = useSaveSheetsAction();

  const [sheets, setSheets] = useState<SheetForm[]>(() => initialSheets.map(fromSheet));
  // 서버 계산결과가 담긴 시트(표시 전용). 활성 시트의 계산값을 read-only로 보여줄 때 참조.
  const [calcSheets, setCalcSheets] = useState<(MeasurementSheet | null)[]>(initialSheets);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeSheet = sheets[activeIndex] ?? null;
  const activeCalcSheet = calcSheets[activeIndex] ?? null;

  const addSheet = (category: MeasurementCategory) => {
    setSheets((prev) => [...prev, getDefaultSheetForm(category)]);
    setCalcSheets((prev) => [...prev, null]);
    setActiveIndex(sheets.length);
  };

  const removeSheet = (index: number) => {
    setSheets((prev) => prev.filter((_, i) => i !== index));
    setCalcSheets((prev) => prev.filter((_, i) => i !== index));
    setActiveIndex((cur) => (cur >= index && cur > 0 ? cur - 1 : cur));
  };

  const updateActiveSheet = (updater: (sheet: SheetForm) => SheetForm) => {
    setSheets((prev) => prev.map((s, i) => (i === activeIndex ? updater(s) : s)));
  };

  const handleSave = async () => {
    if (scheduleId == null) return;

    const errors = sheets.flatMap(validateSheetFields);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    try {
      const detail = await saveSheets(scheduleId, sheets.map(toSheetSave));
      const savedSheets = detail.snapshot.sheets;
      setCalcSheets(savedSheets);
      setSheets(savedSheets.map(fromSheet));
      toast.success("측정 데이터가 저장되었습니다.");
      onSaved?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "저장에 실패했습니다.";
      toast.error(message);
    }
  };

  return {
    sheets,
    activeIndex,
    activeSheet,
    activeCalcSheet,
    editable,
    isLoading,

    setActiveIndex,
    addSheet,
    removeSheet,
    updateActiveSheet,
    handleSave,
  };
};
