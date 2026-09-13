import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { AnalysisResult, SamplingTimesSave } from "./types";
import { scheduleApi } from "../api/api";
import { toAnalysisResults, toSaveSamplingTimesRequest } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

/**
 * 성적서 항목별 채취시간을 일괄 저장한다.
 *
 * 아직 시각이 없던 항목은 채우고, 있으면 갈아끼운다. 실험실 입력값은 건드리지 않으므로
 * 실험·분석 탭과 동시에 열려 있어도 서로를 덮어쓰지 않는다.
 * 응답은 이 계획의 측정항목 전체를 성적서 표기 순서로 담는다.
 */
export const useSaveSamplingTimesAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (scheduleId: number, times: SamplingTimesSave,): Promise<AnalysisResult[]> => {
    const result = unwrapMessage(await scheduleApi.saveSamplingTimes(
      scheduleId, toSaveSamplingTimesRequest(times),
    ));
    return toAnalysisResults(result);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { saveSamplingTimes: run, isLoading, error };
};
