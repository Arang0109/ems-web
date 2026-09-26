import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { ScheduleDetail, ScheduleCustomFieldsSave } from "./types";
import { scheduleApi } from "../api/api";
import { toSaveCustomFieldsRequest, toScheduleDetail } from "../api/mapper";
import { scheduleKeys } from "./query-keys";

/** 회차 커스텀 필드 값 저장(전체 채택). 문서를 쓰는 다른 경로와 같이 자기 도메인 키 전부를 무효화한다. */
export const useSaveCustomFieldsAction = () => {
  const { run, isLoading, error } = useEntityMutation(
    async (id: number, save: ScheduleCustomFieldsSave): Promise<ScheduleDetail> => {
      const result = unwrapMessage(await scheduleApi.saveCustomFields(id, toSaveCustomFieldsRequest(save)));
      return toScheduleDetail(result);
    },
    { invalidateKeys: [scheduleKeys.all] },
  );

  return { saveCustomFields: run, isLoading, error };
};
