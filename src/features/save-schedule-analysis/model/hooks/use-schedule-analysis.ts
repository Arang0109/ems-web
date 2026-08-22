import { useCallback, useEffect, useState } from "react";

import type { AnalysisRecord, MeasurementItemSnapshot } from "@entities/schedule";
import {
  useScheduleAnalyses, useCreateAnalysisAction,
  useUpdateAnalysisAction, useDeleteAnalysisAction,
} from "@entities/schedule";

import { useConfirm } from "@shared/ui/dialogs";
import { toast } from "@shared/ui/toasts";

import { toAnalysisCreate, toAnalysisRows, toAnalysisUpdate } from "../mapper";
import { hasAnalysisInput, type AnalysisRowForm } from "../types";
import { validateAnalysisRows } from "../validator";

interface Params {
  scheduleId: number | null;
  items: MeasurementItemSnapshot[];
  /** 저장 후 상위(측정계획 상세)를 재조회해 상태 배지·완료 버튼을 갱신한다. */
  onSaved?: () => void;
}

/**
 * 항목별 실험분석정보 입력.
 *
 * 행은 계획의 측정항목에서 만들고 저장된 기록을 덮어 채운다. 저장은 <b>바뀐 행만</b> 보내며,
 * 이미 등록된 행은 수정(PUT), 처음 저장하는 행은 등록(POST)으로 갈린다 — 서버에서
 * 한 계획의 한 측정항목에는 기록이 하나뿐이기 때문이다.
 *
 * 삭제는 저장과 섞지 않고 행별 조작으로 둔다. "값을 지우고 저장 = 삭제"로 만들면
 * 실수로 지운 것과 아직 안 넣은 것이 구분되지 않는다.
 */
export const useScheduleAnalysis = ({ scheduleId, items, onSaved }: Params) => {
  const confirm = useConfirm();
  const { fetchAnalyses, isLoading: isFetching, error } = useScheduleAnalyses();
  const { createAnalysis, isLoading: isCreating } = useCreateAnalysisAction();
  const { updateAnalysis, isLoading: isUpdating } = useUpdateAnalysisAction();
  const { deleteAnalysis, isLoading: isDeleting } = useDeleteAnalysisAction();

  const [rows, setRows] = useState<AnalysisRowForm[]>([]);
  const [baselineRows, setBaselineRows] = useState<AnalysisRowForm[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<number, string>>({});

  // 측정항목이 바뀌면(측정정보 탭에서 항목 교체) 행 구성 자체가 달라지므로 다시 만든다.
  const itemsKey = items.map((item) => item.pollutantId).join(",");

  // 서버 기록을 폼과 기준선에 동시에 앉힌다. 기준선이 있어야 "바뀐 행만 저장"이 성립한다.
  const applyRecords = useCallback((records: AnalysisRecord[]) => {
    const next = toAnalysisRows(items, records);
    setRows(next);
    setBaselineRows(next);
    setFieldErrors({});
    // items는 itemsKey로 동일성을 판정한다 — 스냅샷 객체는 재조회마다 새 참조라 그대로 넣으면 무한 루프다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  // 저장·삭제 뒤 서버 값으로 되맞추는 경로. 화면 갱신을 기다려야 하므로 await 가능한 형태로 둔다.
  const load = useCallback(async () => {
    if (scheduleId == null) return;
    applyRecords(await fetchAnalyses(scheduleId));
  }, [scheduleId, fetchAnalyses, applyRecords]);

  // 최초 로드. 응답 콜백에서만 상태를 바꾼다 — 이펙트 본문에서 동기적으로 setState 하면
  // cascading render 가 된다. 응답이 늦게 도착한 이전 계획의 결과는 버린다.
  useEffect(() => {
    if (scheduleId == null) return;

    let isStale = false;
    void fetchAnalyses(scheduleId).then((records) => {
      if (!isStale) applyRecords(records);
    });
    return () => { isStale = true; };
  }, [scheduleId, fetchAnalyses, applyRecords]);

  const dirtyRows = rows.filter((row, index) => isChanged(row, baselineRows[index]));
  const isDirty = dirtyRows.length > 0;
  const filledCount = rows.filter((row) => row.analysisId !== null).length;

  const handleChange = (pollutantId: number, patch: Partial<AnalysisRowForm>) => {
    setRows((prev) =>
      prev.map((row) => (row.pollutantId === pollutantId ? { ...row, ...patch } : row)));
    setFieldErrors((prev) => ({ ...prev, [pollutantId]: "" }));
  };

  const handleSave = async () => {
    if (scheduleId == null || !isDirty) return;

    const errors = validateAnalysisRows(dirtyRows);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      // 순차 저장이다 — 한 건이 실패하면 거기서 멈추고, 이미 저장된 앞 건은 재조회로 화면에 반영된다.
      for (const row of dirtyRows) {
        if (row.analysisId) {
          await updateAnalysis(scheduleId, row.analysisId, toAnalysisUpdate(row));
        } else if (hasAnalysisInput(row)) {
          await createAnalysis(scheduleId, toAnalysisCreate(row));
        }
      }
      toast.success("실험분석정보를 저장했습니다.");
      await load();
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "저장에 실패했습니다.");
      // 어디까지 반영됐는지 서버 값으로 맞춘다.
      await load();
    }
  };

  const handleRemove = async (row: AnalysisRowForm) => {
    if (scheduleId == null || !row.analysisId) return;

    const isConfirmed = await confirm({
      title: "분석 결과 삭제",
      description: `${row.pollutantName} 항목의 분석 결과를 삭제합니다.\n삭제 후 같은 항목으로 다시 입력할 수 있습니다.`,
      confirmLabel: "삭제",
      tone: "danger",
    });
    if (!isConfirmed) return;

    try {
      await deleteAnalysis(scheduleId, row.analysisId);
      toast.success("분석 결과를 삭제했습니다.");
      await load();
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  return {
    rows,
    fieldErrors,
    isDirty,
    filledCount,
    isLoading: isFetching || isCreating || isUpdating || isDeleting,
    error,
    handleChange,
    handleSave,
    handleRemove,
  };
};

/** 입력값 네 칸 중 하나라도 기준선과 다르면 저장 대상이다. */
const isChanged = (row: AnalysisRowForm, baseline: AnalysisRowForm | undefined): boolean => {
  if (!baseline) return hasAnalysisInput(row);
  return row.analysisValue !== baseline.analysisValue
    || row.unit !== baseline.unit
    || row.analysisMethod !== baseline.analysisMethod
    || row.analysisEquipment !== baseline.analysisEquipment;
};
