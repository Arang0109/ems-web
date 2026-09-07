import { useEntityMutation } from "@shared/model";
import type { ScheduleDetail, SheetSave, SheetRef } from "./types";
import { scheduleApi } from "../api/api";
import { toSaveSheetsRequest, toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

export const useSaveSheetsAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, sheets: SheetSave[], deletedSheets: SheetRef[] = [],): Promise<ScheduleDetail> => {
    const response = await scheduleApi.saveSheets(id, toSaveSheetsRequest(sheets, deletedSheets));
    return toScheduleDetail(response);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { saveSheets: run, isLoading, error };
};
