import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { equipmentApi } from "../api/api";
import { equipmentKeys } from "./query-keys";
import type { InspectionRecord } from "./types";

interface Props {
  equipmentId: string | null;
}

/** 장비의 검사 이력. */
export const useInspectionRecords = ({ equipmentId }: Props) =>
  useEntityQuery<InspectionRecord[]>({
    queryKey: equipmentKeys.inspectionRecords(equipmentId as string),
    queryFn: async () => unwrapMessage(await equipmentApi.getInspectionRecords(equipmentId as string)),
    initialData: [],
    enabled: equipmentId != null,
  });
