import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { AnalysisResult, AnalysisResultsSave } from "./types";
import { scheduleApi } from "../api/api";
import { toAnalysisResults, toSaveAnalysisResultsRequest } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

/**
 * 항목별 실험분석 결과를 일괄 저장한다.
 *
 * 측정물질을 키로 upsert 하므로 호출자가 신규·기존을 가릴 필요가 없다 — 성적서 탭이 채취시간을
 * 먼저 채워 둔 항목에도 그대로 저장된다.
 * 채취시간은 건드리지 않아 두 탭이 서로를 덮어쓰지 않는다.
 */
export const useSaveAnalysisResultsAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (scheduleId: number, results: AnalysisResultsSave,): Promise<AnalysisResult[]> => {
    const result = unwrapMessage(await scheduleApi.saveAnalysisResults(
      scheduleId, toSaveAnalysisResultsRequest(results),
    ));
    return toAnalysisResults(result);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { saveAnalysisResults: run, isLoading, error };
};
