import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { scheduleCustomFieldApi } from "../api/api";
import { toScheduleCustomFields } from "../api/mapper";
import { scheduleCustomFieldKeys } from "./query-keys";
import type { ScheduleCustomField } from "./types";

interface Props {
  /** false 면 조회하지 않는다 — 모달이 열릴 때만 목록이 필요한 폼이 쓴다 */
  enabled?: boolean;
}

/** 이 고객사의 커스텀 필드 정의 목록. 표시 순서대로 온다. */
export const useScheduleCustomFields = ({ enabled = true }: Props = {}) =>
  useEntityQuery<ScheduleCustomField[]>({
    queryKey: scheduleCustomFieldKeys.list(),
    queryFn: async () => toScheduleCustomFields(unwrapMessage(await scheduleCustomFieldApi.getCustomFields())),
    initialData: [],
    enabled,
  });
