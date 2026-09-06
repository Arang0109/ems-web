import { useEffect, useMemo } from "react";

import { useScheduleDetail } from "@entities/schedule";
import { isTerminalScheduleStatus } from "@shared/model";
import { getSheetCalcExternals } from "@entities/schedule";
import type { SheetCalcExternals } from "@entities/schedule";
import { useStackPollutants } from "@entities/stack-pollutant";

// 측정계획 상세를 로드하고, 편집 가능 여부(종단 상태 제외)를 계산한다.
export const useScheduleProfile = (scheduleId: string | undefined) => {
  const { data, isLoading: loading, error, fetchSchedule } = useScheduleDetail();

  useEffect(() => {
    if (!scheduleId) return;
    fetchSchedule(Number(scheduleId));
  }, [scheduleId, fetchSchedule]);

  const status = data?.status ?? null;
  // 종단 판정은 shared 헬퍼가 단일 소스다 — 화면이 상태를 직접 비교하면 상태 개편 때 여기만 어긋난다.
  const editable = status !== null && !isTerminalScheduleStatus(status);
  const snapshot = data?.snapshot ?? null;

  // 측정항목 카드는 "이번 계획에 포함된 항목"과 "측정시설에 등록된 나머지"를 함께 보여준다.
  // 스냅샷에는 전자만 있으므로 후자는 측정시설 원장에서 별도로 받아온다.
  // 조회에 실패해도 스냅샷 항목만으로 화면이 성립하므로 로딩·에러는 상위로 올리지 않는다.
  const stackId = snapshot?.client.workplace.stack.stackId ?? null;
  const { data: stackPollutants, fetchStackPollutants } = useStackPollutants();

  useEffect(() => {
    if (stackId === null) return;
    fetchStackPollutants(stackId);
  }, [stackId, fetchStackPollutants]);

  // 시트 계산 미리보기용 외부입력(표준산소·굴뚝 치수·장비 spec)을 스냅샷에서 1회 추출한다.
  const externals = useMemo<SheetCalcExternals>(
    () =>
      snapshot
        ? getSheetCalcExternals(snapshot)
        : {
            stackName: "", standardOxygen: null, shape: null, horizontalLength: null, verticalLength: null,
            pitotCoefficients: [], deltaH: null, nozzleDiameters: [],
          },
    [snapshot],
  );

  return {
    detail: data,
    snapshot: data?.snapshot ?? null,
    stackPollutants,
    externals,
    status,
    editable,
    isLoading: loading,
    error,
    refetch: () => {
      if (!scheduleId) return;
      fetchSchedule(Number(scheduleId));
    },
  };
};
