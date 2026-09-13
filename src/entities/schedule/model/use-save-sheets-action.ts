import { useEntityMutation } from "@shared/model";
import type { SamplingInfoSave, ScheduleDetail, SheetSave, SheetRef } from "./types";
import { scheduleApi } from "../api/api";
import { toSaveSheetsRequest, toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

// 현장 채취 정보(채취 시각·현장 담당자)를 시트와 한 요청으로 보낸다 —
// 같은 스냅샷 노드에 살고 현장 채취 탭이 함께 소유하므로 저장이 한 번에 끝난다.
export const useSaveSheetsAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, samplingInfo: SamplingInfoSave, sheets: SheetSave[], deletedSheets: SheetRef[] = [],): Promise<ScheduleDetail> => {
    const response = await scheduleApi.saveSheets(id, toSaveSheetsRequest(samplingInfo, sheets, deletedSheets));
    return toScheduleDetail(response);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { saveSheets: run, isLoading, error };
};
