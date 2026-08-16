import { useMemo, useState } from "react";

import type {
  ScheduleSnapshot, SheetCalcPreview, SheetCalcExternals
} from "@entities/schedule";
import { calcSheetPreview, calcRequiredPointCount, useSaveSheetsAction } from "@entities/schedule";
import type { MeasurementCategory, ScheduleStatus } from "@shared/model";
import { SCHEDULE_STATUS_LABEL } from "@shared/config";
import { toast } from "@shared/ui/toasts";

import type { SheetForm } from "../types";
import { getDefaultSheetForm } from "../types";
import { toSheetSave, fromSheet } from "../mapper";
import { validateSheetFields } from "../validator";
import { useScheduleBasicInfo } from "./use-schedule-basic-info";
import { useExportSamplingRecords } from "./use-export-sampling-records";

interface Params {
  scheduleId: number | null;
  snapshot: ScheduleSnapshot | null;
  externals: SheetCalcExternals;
  onSaved?: () => void;
}

// 저장 결과. 서버가 상태를 전진시켰으면(시트 최초 저장·시료접수일 최초 입력) advancedTo에 새 상태가 담긴다.
type SaveResult = { ok: false } | { ok: true; advancedTo: ScheduleStatus | null };

// 측정계획의 전체 시트 세트를 관리한다. 서버 PUT은 시트 전체 교체이므로 일괄 저장한다.
// 계산값 표시는 previewCalc(서버 파이프라인 풀 미러링)가 담당한다 — 저장 후에도 폼 값에서 동일하게 재현된다.
export const useSaveSheets = ({
  scheduleId, snapshot, externals, onSaved,
}: Params) => {
  const { saveSheets, isLoading } = useSaveSheetsAction();
  const { form: basicInfoForm, isLoading: isBasicInfoLoading, handleChange, saveBasicInfo } = useScheduleBasicInfo(
    {
      scheduleId,
      basicInfo: snapshot?.basicInfo ?? null,
      team: snapshot?.team ?? null
    });

  const [sheets, setSheets] = useState<SheetForm[]>(() => snapshot?.sheets.map(fromSheet) ?? []);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeSheet = sheets[activeIndex] ?? null;

  // 활성 시트 입력에서 서버 계산값을 프론트에서 실시간으로 재현한 미리보기(effect 금지, 파생만).
  const previewCalc = useMemo<SheetCalcPreview | null>(
    () => (activeSheet ? calcSheetPreview(toSheetSave(activeSheet), externals) : null),
    [activeSheet, externals],
  );

  const addSheet = (category: MeasurementCategory) => {
    // 측정점 수는 굴뚝 치수 기반 규정 요구수로 자동 생성(치수 미입력이면 1개). 수동 조정 가능.
    const pointCount = calcRequiredPointCount(externals) ?? 1;
    setSheets((prev) => [...prev, getDefaultSheetForm(category, pointCount)]);
    setActiveIndex(sheets.length);
  };

  const removeSheet = (index: number) => {
    setSheets((prev) => prev.filter((_, i) => i !== index));
    setActiveIndex((cur) => (cur >= index && cur > 0 ? cur - 1 : cur));
  };

  const updateActiveSheet = (updater: (sheet: SheetForm) => SheetForm) => {
    setSheets((prev) => prev.map((s, i) => (i === activeIndex ? updater(s) : s)));
  };

  // 저장 본체 — 검증 → 공통정보 → 시트 → 서버 계산결과 재동기화.
  // "측정 데이터 저장"과 "저장 후 채취기록지 다운로드" 두 진입점이 공유한다(로직 중복 방지).
  // 성공 toast는 호출부가 낸다 — 다운로드 경로에서 저장·다운로드 toast가 겹치지 않도록.
  const runSave = async (): Promise<SaveResult> => {
    if (scheduleId == null) return { ok: false };

    const errors = sheets.flatMap(validateSheetFields);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return { ok: false };
    }

    const previousStatus = snapshot?.status ?? null;

    try {
      // 공통 정보(채취시간·담당자)를 먼저 반영한다. 실패하면 시트는 건드리지 않아
      // "시트만 저장되고 공통 정보는 실패"하는 부분 성공 상태가 생기지 않는다.
      await saveBasicInfo();

      const detail = await saveSheets(scheduleId, sheets.map(toSheetSave));
      // 서버 계산결과가 반영된 최신 시트로 폼을 동기화한다.
      setSheets(detail.snapshot.sheets.map(fromSheet));
      onSaved?.();

      // 상태 전이는 서버가 판단하므로(시트 최초 저장 → 측정중 등) 저장 전후 값을 비교해 알아낸다.
      const advancedTo = previousStatus !== null && detail.status !== previousStatus ? detail.status : null;
      return { ok: true, advancedTo };
    } catch (err) {
      const message = err instanceof Error ? err.message : "저장에 실패했습니다.";
      toast.error(message);
      return { ok: false };
    }
  };

  const handleSave = async () => {
    const result = await runSave();
    if (!result.ok) return;

    toast.success(
      result.advancedTo
        ? `측정 데이터가 저장되었습니다. 상태가 '${SCHEDULE_STATUS_LABEL[result.advancedTo]}'(으)로 변경되었습니다.`
        : "측정 데이터가 저장되었습니다.",
    );
  };

  // 다운로드 시나리오는 저장 경로를 그대로 재사용한다(runSave 주입).
  const samplingRecordsExport = useExportSamplingRecords({
    scheduleId,
    saveBeforeExport: async () => (await runSave()).ok,
  });

  return {
    sheets,
    activeIndex,
    activeSheet,
    previewCalc,
    // 다운로드 진행 중에도 저장 버튼이 잠기도록 합성한다.
    isLoading: isLoading || isBasicInfoLoading || samplingRecordsExport.isExporting,
    basicInfoForm: basicInfoForm,

    handleBasicInfoChange: handleChange,
    setActiveIndex,
    addSheet,
    removeSheet,
    updateActiveSheet,
    handleSave,

    // 채취기록지 다운로드
    isExportDialogOpen: samplingRecordsExport.isDialogOpen,
    samplingRecordTemplate: samplingRecordsExport.template,
    isExporting: samplingRecordsExport.isExporting,
    setExportDialogOpen: samplingRecordsExport.setIsDialogOpen,
    handleExport: samplingRecordsExport.handleExport,
  };
};
