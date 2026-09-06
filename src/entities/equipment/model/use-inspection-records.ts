import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { equipmentApi } from "../api/api";
import type { InspectionRecord } from "./types";

interface Props {
  equipmentId: string | null;
}

/** 타입 A(자동 로드): 장비의 검사 이력. */
export const useInspectionRecords = ({ equipmentId }: Props) =>
  useFetch<InspectionRecord[]>(
    async () => unwrapMessage(await equipmentApi.getInspectionRecords(equipmentId as string)),
    [],
    { deps: [equipmentId], enabled: equipmentId != null, resetOnChange: true },
  );
