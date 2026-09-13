import { useEntityMutation } from "@shared/model";
import type { ReportDatesUpdate, ScheduleDetail } from "./types";
import { scheduleApi } from "../api/api";
import { toUpdateReportDatesRequest, toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

export const useUpdateReportDatesAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, dates: ReportDatesUpdate,): Promise<ScheduleDetail> => {
    const response = await scheduleApi.updateReportDates(id, toUpdateReportDatesRequest(dates));
    return toScheduleDetail(response.data);
  }, { invalidateKeys: [scheduleKeys.all] });

  return { updateReportDates: run, isLoading, error };
};
