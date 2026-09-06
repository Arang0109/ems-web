import { useAsyncAction } from "@shared/model";
import type { ScheduleDetail, SheetSave, SheetRef } from "./types";
import { scheduleApi } from "../api/api";
import { toSaveSheetsRequest, toScheduleDetail } from "../api/mapper";

export const useSaveSheetsAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, sheets: SheetSave[], deletedSheets: SheetRef[] = [],): Promise<ScheduleDetail> => {
    const response = await scheduleApi.saveSheets(id, toSaveSheetsRequest(sheets, deletedSheets));
    return toScheduleDetail(response);
  });

  return { saveSheets: run, isLoading, error };
};
